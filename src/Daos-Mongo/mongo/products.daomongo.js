// Importaciones
//const { ObjectId } = require('bson');
const { productModel } = require('./Models/products.model');  // Importa el modelo de productos

// Clase ProductDaoMongo
class ProductDaoMongo {
  constructor() {
    // Inicialización del modelo de productos
    this.model = productModel;
  }

  // Método para obtener productos con filtros y paginación
  getProducts = async (filters = {}) => {
    const query = filters && filters.query ? filters.query : {};
    const options = {
      limit: filters.limit * 1 || 10,  // Ajusta el valor por defecto si es necesario
      page: filters.page * 1 || 1,    // Ajusta el valor por defecto si es necesario
    };

    // Filtrar por categoría si está presente
    if (filters.category) {
      const categories = await this.getCategorys();
      if (typeof categories === 'string') {
        return 'Hubo un error en la petición';
      }
      if (categories.includes(filters.category)) {
        query['category'] = filters.category;
      }
    }

    // Filtrar por disponibilidad si está presente
    if (filters.availability) {
      query['stock'] = { $gt: 0 };
    }

    // Ordenar por precio si está presente
    if (filters.sort * 1 === 1 || filters.sort * 1 === -1) {
      options['sort'] = { price: filters.sort * 1 };
    }
    if (filters.sort === 'asc' || filters.sort === 'desc') {
      options['sort'] = { price: filters.sort };
    }

    try {
      // Realizar consulta paginada a la base de datos
      const result = await this.model.paginate(query, options);
      return result;
    } catch (error) {
      return 'Hubo un error en la petición';
    }
  };

  // Método para obtener un producto por su ID
  getProductsById = async (pid) => {
    try {
      const result = await this.model.find({ _id: pid }).lean();

      if (result.length === 0) {
        return 'Producto no encontrado';
      }
      return result[0];
    } catch (error) {
      return 'Ha ocurrido un error al buscar el producto';
    }
  };

  // Método para agregar un nuevo producto
  addProduct = async ({
    title,
    description,
    code,
    price,
    stock,
    status = true,
    category,
    thumbnail,
  }) => {
    try {
      // Validaciones y creación de un nuevo producto
      // ...

      const newProduct = {
        title: title,
        description: description,
        code: code,
        price: price,
        status: status,
        stock: stock,
        category: category,
        thumbnail: thumbnail,
      };

      return await this.model.create(newProduct);
    } catch (error) {
      // Manejo de errores, incluyendo códigos duplicados
      if (error.code === 11000) {
        return 'ERROR: codigo repetido';
      }
      return 'Verificar ERROR de mongoose codigo: ' + error.code;
    }
  };

  // Método para actualizar un producto por su ID
  updateProduct = async (pid, changedProduct) => {
    const updateProd = await this.getProductsById(pid);

    if (updateProd.length === 0) {
      return 'Producto no encontrado';
    }

    try {
      // Actualizar el producto y devolver el resultado actualizado
      await this.model.updateOne({ _id: pid }, changedProduct);
      return await this.getProductsById(pid);
    } catch (error) {
      // Manejo de errores, incluyendo códigos duplicados
      if (error.code === 11000) {
        return 'ERROR: esta queriendo ingresar un codigo repetido';
      }
      return 'ERROR: se ha producido une error al modificar el producto';
    }
  };

  // Método para eliminar un producto por su ID
  deleteProductById = async (pid) => {
    const deleteProd = await this.getProductsById(pid);

    if (deleteProd.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      // Eliminar el producto y devolver el resultado eliminado
      await this.model.deleteOne({ _id: pid });
      return deleteProd;
    } catch (error) {
      return 'Hubo un error en la peticion';
    }
  };

  // Método para eliminar un producto por su código
  deleteProductByCode = async (pcode) => {
    const productoEliminado = await this.model.find({ code: pcode });

    if (productoEliminado.length === 0) {
      return 'Producto no encontrado';
    }
    try {
      // Eliminar el producto por código y devolver el resultado eliminado
      await this.model.deleteOne({ code: pcode });
      return productoEliminado;
    } catch (error) {
      return 'Hubo un error en el la peticion';
    }
  };

  // Método para obtener todas las categorías
  getCategorys = async () => {
    try {
      // Obtener todas las categorías de la base de datos
      const list = await this.model.aggregate([
        { $group: { _id: '$category' } },
      ]);
      // Crear un array de categorías
      const arrayCategory = list.map((x) => {
        return x._id;
      });
      return arrayCategory;
    } catch (error) {
      return 'Ocurrio un Error';
    }
  };
}

// Exportar la clase ProductDaoMongo
exports.ProductMongo = ProductDaoMongo;
