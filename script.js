const botaoTema = document.querySelector(".btn-theme");
const inputBusca = document.querySelector(".input");
const botaoAnterior = document.querySelector(".btn-prev");
const divMoviesGallery = document.querySelector(".movies");
const botaoPosterior = document.querySelector(".btn-next");
const modal = document.querySelector(".modal");

const urlBase = "https://tmdb-proxy.cubos-academy.workers.dev/3/";

let inicio = 0;
let fim = 5;
let vetorFilmes = [];

function promessaResposta() {
    const resultado = fetch(urlBase + "discover/movie?language=pt-BR&include_adult=false");

    resultado.then( res => {
        const promessaDados = res.json();

        promessaDados.then( ( { results: infos } ) => {
            vetorFilmes = infos;
            
            criarFilmes();
        } );
    } );
};

promessaResposta();

function criarFilmes() {
    vetorFilmes.slice(inicio, fim).forEach( dado => {
        const divMovie = document.createElement("div");
        divMovie.classList.add("movie");

        const imgUrl = dado.poster_path;
        divMovie.style.backgroundImage = `url('${imgUrl}')`;

        const divMovieInfo = document.createElement("div");
        divMovieInfo.classList.add("movie__info");

        const spanTitle = document.createElement("span");
        spanTitle.classList.add("movie__title");
        spanTitle.textContent = dado.title;
        
        const imgEstrela = document.createElement("img");
        const imgEstrelaUrl = "./assets/estrela.svg";
        imgEstrela.setAttribute("src", imgEstrelaUrl);
        imgEstrela.setAttribute("alt", "Estrela");
        imgEstrela.style.marginRight = "4px";

        const spanNota = document.createElement("span");
        spanNota.classList.add("movie__rating");
        spanNota.textContent = dado.vote_average;

        spanNota.insertAdjacentElement("afterbegin", imgEstrela );
        divMovieInfo.append( spanTitle, spanNota );
        divMovie.append( divMovieInfo );
        divMoviesGallery?.append( divMovie );
        
        criarModal(divMovie, dado.id);
    } );
};

function criarModal(elemento, id) {
    elemento.addEventListener( 'click', () => {
        modal?.classList.remove("hidden");

        const promessaResposta = fetch(urlBase + `movie/${id}?language=pt-BR`);

        promessaResposta.then( res => {
            const promessaDados = res.json();

            promessaDados.then( dado => {
                const modalTitulo = document.querySelector(".modal__title");
                modalTitulo.textContent = dado.title;

                const modalImg = document.querySelector(".modal__img");
                const modalImgUrl = dado.backdrop_path;
                modalImg?.setAttribute("src", modalImgUrl);

                const modalDescricao = document.querySelector(".modal__description");
                modalDescricao.textContent = dado.overview;

                const modalNota = document.querySelector(".modal__average");
                modalNota.textContent = dado.vote_average.toFixed(1);

                const modalGeneros = document.querySelector(".modal__genres");
                const generos = dado.genres;                    
                
                while (modalGeneros?.firstChild) {
                    modalGeneros.removeChild(modalGeneros.firstChild);
                };
                
                for (const genero of generos) {
                    const modalGenero = document.createElement("span");
                    modalGenero.classList.add("modal__genre");
                    modalGenero.textContent = genero.name;
                    modalGeneros?.append(modalGenero);
                }
            } );
        } );
    } );
};

const sairModal = event => {
    if (/* event.target !== event.currentTarget &&  */event.target !== modal?.firstElementChild) {
        return;
    }

    modal?.classList.add("hidden");
};

modal?.addEventListener("click", sairModal);

botaoPosterior?.addEventListener( 'click', () => {    
    inicio += 5;
    fim += 5;

    if (fim > vetorFilmes.length) {
        inicio = 0;
        fim = 5;
    }

    divMoviesGallery.innerHTML = "";
    criarFilmes();
});

botaoAnterior?.addEventListener( 'click', () => {
    inicio -= 5;
    fim -= 5;
    
    if (inicio < 0) {
        inicio = vetorFilmes.length - 5;
        fim = vetorFilmes.length;
    }
    
    divMoviesGallery.innerHTML = "";
    criarFilmes();
});

const promessaFilmeDoDia = fetch(urlBase + "movie/436969?language=pt-BR");
promessaFilmeDoDia.then( res => {
    const promessaDados = res.json();

    promessaDados.then( dado => {
        const filmeDoDiaVideo = document.querySelector(".highlight__video");
        const imgUrl = dado.backdrop_path;
        filmeDoDiaVideo.style.background = `no-repeat center/100% url("${imgUrl}")`;
        
        const filmeDoDiaTitulo = document.querySelector(".highlight__title");
        filmeDoDiaTitulo.textContent = dado.title;

        const filmeDoDiaNota = document.querySelector(".highlight__rating");
        filmeDoDiaNota.textContent = dado.vote_average.toFixed(1);
        
        const filmeDoDiaGeneros = document.querySelector(".highlight__genres");
        const vetorGeneros = [];
        dado.genres.forEach( genero => vetorGeneros.push(genero.name) );
        const generos = vetorGeneros.join(", ");
        filmeDoDiaGeneros.textContent = generos;
    
        const filmeDoDiaLancamento = document.querySelector(".highlight__launch");
        // Buscar sobre locales.
        const opcoes = { year: "numeric", month: 'long', day: "numeric" };
        const dataLancamento = new Date(dado.release_date).toLocaleDateString("pt-BR" , opcoes);
        filmeDoDiaLancamento.textContent = " " + dataLancamento;
    
        const filmeDoDiaDescricao = document.querySelector(".highlight__description");
        filmeDoDiaDescricao.textContent = dado.overview;
    } ); 
} );

const promessaFilmeDoDiaVideo = fetch(urlBase + "movie/436969/videos?language=pt-BR");
promessaFilmeDoDiaVideo.then( res => {
    const promessaDados = res.json();

    promessaDados.then( dado => {
        const filmeDoDiaLink = document.querySelector(".highlight__video-link");
        const hrefVideo = `https://www.youtube.com/watch?v=${dado.results[0].key}`;
        filmeDoDiaLink?.setAttribute("href", hrefVideo);
    } );
} );

inputBusca?.addEventListener( "keydown", event => {
    inicio = 0;
    fim = 5;
    
    if (event.code !== "Enter") {
        return;
    }

    divMoviesGallery.innerHTML = "";
    
    const pesquisa = inputBusca.value.trim();
    if (pesquisa === "") {
        inputBusca.value = "";
        promessaResposta();
        return;
    }
    
    fetch(`https://tmdb-proxy.cubos-academy.workers.dev/3/search/movie?language=pt-BR&include_adult=false&query=${inputBusca.value}`).then( res => {
        if (!res.ok) {
            inputBusca.value = "";
            return;
        }

        const promissaDados = res.json();

        promissaDados.then( infos => {
            inputBusca.value = "";
            vetorFilmes = infos.results;

            if (vetorFilmes.length > 0) {
                criarFilmes();
            } else {
                promessaResposta();
                return;
            }
        });
    });
});

botaoTema?.addEventListener( 'click', () => {
    const body = document.querySelector('body');

    if (body?.classList.contains("dark")) {
        body.classList.remove("dark");
        botaoTema.src = "./assets/dark-mode.svg";
        botaoAnterior.src = "./assets/seta-esquerda-preta.svg";
        botaoPosterior.src = "./assets/seta-direita-preta.svg";
    } else {
        body?.classList.add("dark");
        botaoTema.src = "./assets/light-mode.svg";
        botaoAnterior.src = "./assets/seta-esquerda-branca.svg";
        botaoPosterior.src = "./assets/seta-direita-branca.svg";
    }
});
