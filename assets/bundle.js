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


