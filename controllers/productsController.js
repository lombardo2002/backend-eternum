const path = require("path");
const fs = require("fs");

const productsFile = path.join(__dirname, "../data/products.json");

module.exports = {
    getAll: (req, res) => {
        const products = JSON.parse(fs.readFileSync(productsFile));
        res.json(products);
    }
}