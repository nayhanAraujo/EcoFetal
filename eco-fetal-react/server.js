// server.js
const express = require('express');
const path    = require('path');
const app     = express();

// 1) sirva tudo de eco-fetal-react/build
app.use(express.static(path.join(__dirname, 'eco-fetal-react', 'build')));

// 2) para qualquer rota, devolva o index.html do build
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'eco-fetal-react', 'build', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
