'use strict';

const getFile = filename => {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `http://localhost:3000/files/${filename}`, true);

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
    xhr.open('GET', `http://localhost:3000/files`, true);

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
let deleteData = document.querySelector('.delete-data');
let downloadData = document.querySelector('.download-data');

function uploadHandler() {
  console.log('uploadHandler', uploadData);
}
function deleteHandler() {
  console.log('deleteHandler', deleteData);
}
function downloadHandler() {
  getFile(downloadData.value)
    .then(
      result => {
        console.log(result)
      },
      error => console.error(error)
    )
  ;
}

document.querySelector('.upload').addEventListener('click', uploadHandler);
document.querySelector('.delete').addEventListener('click', deleteHandler);
document.querySelector('.download').addEventListener('click', downloadHandler);

const ulClickHandler = event => {
  const target = event.target;
  console.log(target);
};

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
    console.log(ul);

    document.querySelector('.result').innerHTML = '';
    document.querySelector('.result').appendChild(ul);
  });


