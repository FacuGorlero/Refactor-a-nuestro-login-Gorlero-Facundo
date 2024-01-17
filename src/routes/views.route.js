const { Router } = require('express');
//const { PManager } = require('../daos/file/ProductManager');
const { ProductMongo } = require('../Daos-Mongo/mongo/products.daomongo');
const { userModel } = require('../Daos-Mongo/mongo/Models/user.model.js');
const { authentication } = require('../helper/auth.midleware.js');
const router = Router();

//const productsMock = new PManager('./src/daos/file/mock/Productos.json');
const productsMongo = new ProductMongo();

router.get('/', async (req, res) => {
  res.redirect("/products");
})

router.get('/products', async (req, res) => {
  // handle fetching products
  const { page = 1, sort, category, availability } = req.query;
  let others = '';
  if (sort) others += '&sort=' + sort;
  if (category) others += '&category=' + category; 
  if (availability) others += '&availability=' + availability;

  let resp = await fetch(
    `http://localhost:8080/api/products?page=${page}&limit=5${others}`,
  );
  resp = await resp.json();
  // console.log(resp);

  // inform error
  let productError = false;
  let pageError = false;
  if (resp.status === 'error') {
    productError = true;
  }
  // update product
  let product;
  if (!productError) {
    product = await resp.payload;
    product.forEach((prd) => {
      prd.price = new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(
        prd.price,
      );
      prd['unavailability'] = prd.stock == 0;
      prd['link'] = `/products/${prd._id}`;
    });
  }
  //console.log(productError, product);

  // update url and security
  let workingUrl = req.url.split('?')[1];
  let arrayString;

  if (workingUrl) {
    arrayString = workingUrl.split('&');

    let secPage = arrayString.findIndex((elm) => elm.split('=')[0] == 'page');
    if (secPage != -1) {
      secPage = arrayString[secPage].split('=')[1]
      if (secPage > resp.totalPages || secPage < 0) {
        pageError = true;
    }}
  }

  function filterUrl(array, filter) {
    if (!workingUrl) return '/products?';
    //let array = string.split('&');
    array = array.filter((elm) => elm.split('=')[0] != filter);
    array = array.filter((elm) => elm.split('=')[0] != 'page');
    if (array.length === 0) {
      finalText = '/products?';
    } else {
      finalText = '/products?' + array.join('&') + '&';
    }
    return finalText;
  }
  const url = filterUrl(arrayString, 'category');

  res.render('products', {
    title: 'Inicio',
    pageError,
    productError,
    product,
    page: resp.page,
    totalPages: resp.totalPages,
    hasPrevPage: resp.hasPrevPage,
    hasNextPage: resp.hasNextPage,
    prevLink: `${filterUrl(arrayString, 'x')}${resp.prevLink}`,
    nextLink: `${filterUrl(arrayString, 'x')}${resp.nextLink}`,
    category: await productsMongo.getCategorys(),
    ascend: `${filterUrl(arrayString, 'sort')}sort=asc`,
    descend: `${filterUrl(arrayString, 'sort')}sort=desc`,
    disorderly: `${filterUrl(arrayString, 'sort')}sort=disorderly`,
    availability: `${filterUrl(arrayString, 'availability')}availability=false`,
    unavailability: `${filterUrl(arrayString, 'availability')}availability=true`,
    url,
  });
});

router.get('/products/:pid', async (req, res) => {
  const objectRender = { title: 'Producto' }
  const pid = req.params.pid;

  let resp = await fetch(`http://localhost:8080/api/products/${pid}`);
  resp = await resp.json();

  const product = resp.payload;

  if (resp.status == "ok") {
    objectRender['productError'] = false
    objectRender['product'] = product
    objectRender['cart'] = `65972d79b542b94fc2b4ed95`
  } else {
    objectRender['productError'] = true
  }
  //console.log(objectRender);
  res.render('product', objectRender)
})

router.get('/cart', async (req, res) => {
  const objectRender = { title: 'Carrito' }
  let resp = await fetch(
    `http://localhost:8080/api/carts/65972d79b542b94fc2b4ed95`,
  );
  resp = await resp.json();
  const cart = resp.payload;
  const products = cart.products;
  products.forEach(prd => {
    prd['total'] = prd.product.price * prd.quantity;
  })

  if (resp.status == "ok") {
    objectRender['cartError'] = false;
    objectRender['cartId'] = cart._id;

    if(products.length != 0) {
      objectRender['cartNoEmpty'] = true;
      objectRender['products'] = products;
    } 

  } else {
    objectRender['cartError'] = true
  }

  res.render('cart', objectRender)
})

router.get('/realTimeProducts', async (req, res) => {
  let resp = await fetch(`http://localhost:8080/api/products?limit=100`);
  resp = await resp.json();
  const product = resp.payload;

  product.forEach((prd) => {
    prd.price = new Intl.NumberFormat('es-ES', { style: 'decimal' }).format(
      prd.price,
    );
  });
  res.render('realTimeProducts', {
    title: 'Productos en tiempo Real',
    product,
  });
});

router.get('/chat', async (req, res) => {
  res.render('chat', {});
});

router.get('/register', async (req, res) => {
  res.render('register');
});

router.get('/login', async (req, res) => {
  res.render('login');
});

router.get('/users', authentication, async (req, res) => {
  const { numPage, limit=10 } = req.query
  const {
      docs,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      page
  } = await userModel.paginate({}, {limit, page: numPage, sort: 1, lean: true})
  console.log(result)
  res.render('users', {
      users: docs,
      hasNextPage,
      hasPrevPage,
      prevPage,
      nextPage,
      page
  })
})


exports.viewsrouter = router;