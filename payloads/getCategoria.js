const got = require('got');

got('http://localhost:3000/categoria/6').json()
    .then(console.log)
    .catch(e => console.error(e.response.body));