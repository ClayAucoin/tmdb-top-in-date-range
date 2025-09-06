let getListButton = document.getElementById("getListButton");
let tmdbResponse = "";

getListButton.addEventListener("click", () => {
    getList();
});

function getList() {
    fetch(`https://api.themoviedb.org/3/search/movie?query=Inception&api_key=233469629197eedb0360cdcc44c77703`)
        .then(r => r.json()).then(tmdbResponse);

        console.log(tmdbResponse);
}

