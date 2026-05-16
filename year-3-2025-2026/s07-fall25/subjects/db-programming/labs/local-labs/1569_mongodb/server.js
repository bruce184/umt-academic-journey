const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

// URL kết nối MongoDB (có thể cấu hình bằng biến môi trường)
const uri = process.env.MONGO_URI || "mongodb://localhost:27017";

// Tên database và collection (mặc định kết nối tới DB '1569' như trong ảnh)
const dbName = process.env.MONGO_DB_NAME || "1569";
const collectionName = "products";

const PORT = process.env.PORT || 3002;

let db, productsCollection;

async function start() {
  try {
    const client = await MongoClient.connect(uri);
    console.log("✅ Đã kết nối MongoDB thành công!");
    db = client.db(dbName);
    productsCollection = db.collection(collectionName);

    // Start the server only after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Lỗi MongoDB:", err);
    // Exit process if DB connection cannot be established
    process.exit(1);
  }
}

// Route GET: Lấy tất cả sản phẩm
app.get("/products", async (req, res) => {
  if (!productsCollection) {
    return res.status(503).json({ error: "Database chưa kết nối" });
  }
  try {
    const products = await productsCollection.find().toArray();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi lấy danh sách sản phẩm!" });
  }
});

// Route POST: Thêm sản phẩm
app.post("/products", async (req, res) => {
  if (!productsCollection) {
    return res.status(503).json({ error: "Database chưa kết nối" });
  }
  try {
    const newProduct = req.body;
    if (!newProduct || Object.keys(newProduct).length === 0) {
      return res.status(400).json({ error: "Dữ liệu sản phẩm không được để trống" });
    }
    const result = await productsCollection.insertOne(newProduct);
    res.status(201).json({ insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi thêm sản phẩm!" });
  }
});

// Route DELETE: Xóa sản phẩm theo id (ObjectId) hoặc theo sku (nếu id không phải ObjectId)
app.delete("/products/:id", async (req, res) => {
  if (!productsCollection) {
    return res.status(503).json({ error: "Database chưa kết nối" });
  }

  const { id } = req.params;
  try {
    // Nếu id hợp lệ là ObjectId thì xóa theo _id, ngược lại thử xóa theo sku
    const filter = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { sku: id };
    const result = await productsCollection.deleteOne(filter);
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm để xóa" });
    }
    return res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Lỗi khi xóa sản phẩm" });
  }
});



// Export app for testing and start the server
module.exports = app;

start();