'use strict';
const ulClickHandler = event => {
  const target = event.target;

  if (target.value == 'открыть') {
    console.log(`открыть файл ${target.name}`);
    getFile(target.name)
      .then(result => {
        console.log(result);
        fileResultElement.innerText = result;
      })
  } else if (target.value == 'удалить') {
    console.log(`удалить файл ${target.name}`);
    if (confirm(`Удалить файл${target.name}?`)) {
      delFile(target.name)
        .then(result => {
          console.log(result);
        })
    }
  }
};

const getFile = filename => {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:8000/files/${filename}`, true);

    xhr.onload = function () {
      if (this.status == 200) {

        resolve(this.response);
      } else {
        let error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });
};

const postFile = file => {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `http://localhost:8000/files`, true);

    xhr.onload = function () {
      if (this.status == 200) {

        resolve(this.response);
      } else {
        let error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network Error"));
    };

    xhr.send(file);
  });
};

const delFile = filename => {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', `http://localhost:8000/files/${filename}`, true);

    xhr.onload = function () {
      if (this.status == 200) {

        resolve(this.response);
      } else {
        let error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });
};

const getAllFiles = () => {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:8000/files`, true);

    xhr.onload = function () {
      if (this.status == 200) {

        resolve(this.response);
      } else {
        let error = new Error(this.statusText);
        error.code = this.status;
        reject(error);
      }
    };

    xhr.onerror = function () {
      reject(new Error("Network Error"));
    };

    xhr.send();
  });
};

let uploadData = document.querySelector('.upload-data');
const fileListElement = document.querySelector('.file-list');
const fileResultElement = document.querySelector('.file-result');

function uploadHandler() {
  console.log('uploadHandler', uploadData.value);
  postFile(uploadData.files[0])
    .then(
      result => {
        console.log('uploadHandler: result', result);
      },
      console.error
    )
}

document.querySelector('.upload').addEventListener('click', uploadHandler);


getAllFiles()
  .then(files => {
    const fileList = files.split(',');
    let ul = document.createElement('ul');
    ul.addEventListener('click', ulClickHandler);
    for (let i = 0; i < fileList.length; i++) {
      let li = document.createElement('li');
      let span = document.createElement('span');

      let buttonOpen = document.createElement('input');
      buttonOpen.setAttribute('type', 'button');
      buttonOpen.setAttribute('class', 'button-open');
      buttonOpen.setAttribute('name', fileList[i]);
      buttonOpen.setAttribute('value', 'открыть');

      let buttonDel = document.createElement('input');
      buttonDel.setAttribute('type', 'button');
      buttonDel.setAttribute('class', 'button-del');
      buttonDel.setAttribute('name', fileList[i]);
      buttonDel.setAttribute('value', 'удалить');

      span.innerText = fileList[i];


      li.appendChild(span);
      li.appendChild(buttonOpen);
      li.appendChild(buttonDel);
      ul.appendChild(li);
    }

    fileListElement.innerHTML = '';
    fileListElement.appendChild(ul);
  });


