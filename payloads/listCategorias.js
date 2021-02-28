const got = require('got');

got('http://localhost:3000/categoria').json().then(console.log).catch(console.error);