const mongoose =require("mongoose")

function connectToDB(){
    mongoose.connect(process.env.MONGO_URL)
    .then(()=>console.log("Server is connected to DB"))
    .catch((err)=>{
        console.log("Error connecting mongodb",err.message);
        process.exit(1);
    })
}

module.exports = connectToDB;