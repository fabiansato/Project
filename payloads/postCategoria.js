const got = require('got');

got.post('http://localhost:3000/categoria', {
    searchParams: {
        nombre: 'horror 2'
    }
}).json()
    .then(console.log)
    .catch(e => console.error(e.response.body));
