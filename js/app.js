const apiEndpoint = 'https://api.github.com/repos/moshfeu/commit-bot-test/';
const atPart = 'access_token=607f47e20050fd00f585478f95f039af7d48e66f';
// 1) get a promise of the content
var promise = new JSZip.external.Promise(function (resolve, reject) {
  JSZipUtils.getBinaryContent('https://expo.io/--/api/v2/snack/download/@moshfeu/vigorous-fudge', function(err, data) {
      if (err) {
          reject(err);
      } else {
          resolve(data);
      }
  });
});

const queue = [];
promise.then(JSZip.loadAsync)                     // 2) chain with the zip promise
.then(function(zip) {
  Object.keys(zip.files)
    .filter(path => path.indexOf('.') > -1 && !(/\.(gif|jpe?g|tiff|png)$/i).test(path))
    .forEach(path => {
      const content = new TextDecoder("utf-8").decode(zip.files[path]._data.compressedContent);
      // console.log(file, zip.files[file], content);
      queue.push(() => {
        return handleFile({
          path,
          content
        }).then(data => console.log(data))
      });
    });

  handleQueueItem(queue, 0);
});

function handleQueueItem(queue, index) {
  if (index < queue.length) {
    queue[index]().then(() => {
      handleQueueItem(queue, ++index);
    });
  }
}

function handleFile(file) {
  return getFileShaAndContentIfExists(file.path)
    .then(({sha, content}) => {
      if (!sha) {
        return createFile(file);
      }
      return updateFile(file, sha, content);
    })
    .catch(() => {
      return createFile(file);
    })
}

function getFileShaAndContentIfExists(path) {
  return fetch(`${apiEndpoint}contents/${path}?${atPart}`)
    .then(data => data.json())
    .then(({sha, content}) => ({
      sha,
      content
    }));
}

function updateFile(file, sha, remoteContent) {
  const content = btoa(file.content);
  const pureRemoteContent = remoteContent.replace(/\n/g, '');
  if (content === pureRemoteContent) {
    return Promise.resolve({});
  }
  return fetch(`${apiEndpoint}contents/${file.path}?${atPart}`, {
    method: 'PUT',
    mode: 'cors',
    body: JSON.stringify({
      message: `message ${Date.now()}`,
      content,
      sha
    }),
  }).then(data => data.json())
}

function createFile(file) {
  return fetch(`${apiEndpoint}contents/${file.path}?${atPart}`, {
    method: 'PUT',
    mode: "cors",
    body: JSON.stringify({
      message: `message ${Date.now()}`,
      content: btoa(file.content)
    }),
  })
    .then(data => data.json())
    .catch(err => console.error(err))
}