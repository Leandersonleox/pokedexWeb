
let offsetAtual = 0;
const limitePorPagina = 20;
let favoritos = JSON.parse(localStorage.getItem('pokedex-favoritos')) || [];

async function carregarPokemons() {
    const lista = document.getElementById('pokemon-list');
    lista.innerHTML = '<p>Carregando...</p>'
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${offsetAtual}&limit=${limitePorPagina}`);
        const data = await response.json();

        lista.innerHTML = '';

        const promessas = data.results.map(pokemon =>
            carregarDetalhesPokemon(pokemon.url)
        );

        await Promise.all(promessas);
    } catch (error) {
        console.error('Erro ao carregar os pokémons:', error);
    }
}

async function carregarDetalhesPokemon(url) {
    const response = await fetch(url);
    const pokemon = await response.json();
    const pokemonList = document.getElementById('pokemon-list');

    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const isFavorito = favoritos.includes(pokemon.id);

    card.innerHTML = `
        <button class="btn-favorito ${isFavorito ? 'ativo' : ''}"
            onclick="toggleFavorito(event, ${pokemon.id})">
            ★
        </button>
        <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>Tipo: ${pokemon.types.map(type => type.type.name).join(', ')}</p>

    `;
    card.addEventListener('click', () => {
        mostrarDetalhesPokemon(pokemon);
    });

    pokemonList.appendChild(card);
}

function mostrarDetalhesPokemon(pokemon) {
    const asideDetalhes = document.getElementById('detalhes');

    const altura = pokemon.height / 10; // Convertendo para metros
    const peso = pokemon.weight / 10; // Convertendo para kg
    const tipos = pokemon.types.map(type => type.type.name).join(', ');

    asideDetalhes.classList.add('ativo');

    asideDetalhes.innerHTML = `
        <div class="detalhes-container">
            <div class = "detalhes-header">
                <button class="btn-fechar" onclick="fecharDetalhes()">X</button>
                <img src="${pokemon.sprites.other['official-artwork'].front_default}" alt="${pokemon.name}">
                <h2>${pokemon.name.toUpperCase()}</h2>
            </div>
            <div class= "detalhes-info">
            <p><strong>Tipos:</strong> ${tipos}</p>
                <p><strong>Altura:</strong> ${altura} m</p>
                <p><strong>Peso:</strong> ${peso} kg</p>
            </div>
        </div>
    `;

}
function fecharDetalhes() {
    const asideDetalhes = document.getElementById('detalhes');
    asideDetalhes.classList.remove('ativo');
    asideDetalhes.innerHTML = '';
}
async function buscarPokemonEspecifico() {
    const input = document.getElementById('pesquisa');
    const termo = input.value.toLowerCase().trim();
    const lista = document.getElementById('pokemon-list');
    const nav = document.getElementById('navegacao');

    if (termo === '') {
        if (nav) nav.style.display = 'block';
        carregarPokemons();
        return;
    }
    try {

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${termo}`);
        if (!response.ok) throw new Error('Pokémon não encontrado');

        const pokemon = await response.json();
        lista.innerHTML = '';

        if (nav) nav.style.display = 'none';

        await carregarDetalhesPokemon(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/`);
    } catch (error) {
        lista.innerHTML = '<p>Pokémon não encontrado!</p>';
    }
}
function toggleFavorito(event, id) {
    event.stopPropagation();
    const index = favoritos.indexOf(id);
    const botao = event.target;

    if (index === -1) {
        favoritos.push(id);
        botao.classList.add('ativo');
    } else {
        favoritos.splice(index, 1);
        botao.classList.remove('ativo');
    }
    localStorage.setItem('pokedex-favoritos', JSON.stringify(favoritos));
}
function carregarFavoritos() {
    const btn = document.getElementById('btn-mostrar-favoritos');
    const lista = document.getElementById('pokemon-list');
    const nav = document.getElementById('navegacao');

    if (favoritos.length === 0) {
        lista.innerHTML = '<p>Nenhum Pokémon favorito encontrado!</p>';
        return;
    }

    btn.textContent = "Mostrar Favoritos ❤️";
    btn.classList.add('ativo');
    if (nav) nav.style.display = 'none';
    lista.innerHTML = '';

    favoritos.forEach(id => {
        carregarDetalhesPokemon(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    });
}

async function inicializar() {
    console.log('Inicializando Pokedex Web...');
    const inputPesquisa = document.getElementById('pesquisa');

    inputPesquisa.addEventListener('keypress', (e) => {

        if (e.key === 'Enter'){
            buscarPokemonEspecifico();
            inputPesquisa.value = '';
        }
            
    });
     
    document.getElementById('btn-buscar').addEventListener('click', buscarPokemonEspecifico);
    document.getElementById('btn-buscar').addEventListener('click', () => {
        inputPesquisa.value = '';
    });

    document.getElementById('voltar').addEventListener('click', () => {
        const nav = document.getElementById('navegacao');
        if (nav) nav.style.display = 'block';
        carregarPokemons();
    });

    document.getElementById('btn-avancar').addEventListener('click', () => {
        offsetAtual += limitePorPagina;
        carregarPokemons();
    });

    document.getElementById('btn-voltar').addEventListener('click', () => {
        offsetAtual = Math.max(0, offsetAtual - limitePorPagina);
        carregarPokemons();
    });
    document.getElementById('btn-mostrar-favoritos').addEventListener('click', carregarFavoritos);

    await carregarPokemons();
}
document.addEventListener('DOMContentLoaded', inicializar);