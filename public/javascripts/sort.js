import Sortable from "/javascripts/sortable.esm.js";

// Initialize Sortable
let list = document.querySelector('div');
let sort = Sortable.create(list);

let convertButton = document.querySelector('a.convert');

//when the convert button is clicked
convertButton.onclick = () => {
    let images = document.querySelectorAll('img');
    let loader = document.querySelector('span.loader');
    let convertText = document.querySelector('span.text');
    let downloadButton = document.querySelector('a.download');

    let filenames = [];
    //get the filenames from the images into an array
    for(let image of images){
        filenames.push(image.dataset.name)
    }

    //show the loader
    loader.style.display = "inline-block";
    convertText.style.display = "none";

    // a post req that'll send the image filenames to the server and get a link to the pdf
    fetch('/pdf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filenames)
    })
    .then((resp) => {
        return resp.text()
    })
    .then((data) => {
        //hide the loader
        loader.style.display = "none";

        //show the download button
        convertText.style.display = "inline-block";
        downloadButton.style.display = "inline-block";

        //set the download button href to the pdf link
        downloadButton.href = data;
    })
    .catch((err) => {
        console.log(err.message);
    })
}