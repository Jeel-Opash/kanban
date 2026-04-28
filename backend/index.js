require("dotenv").config({ path: "./src/.env" });
const connectToDB = require("./src/config/db.js");
const app = require('./src/app.js');

connectToDB();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
