const connectToMongo = require("./db");
var cors = require("cors");

const express = require("express");
connectToMongo();

const app = express();
const port = 5000;
// var app = express()

app.get("/", (req, res) => res.send("Hello Parth!"));
app.use(cors({ origin: true })); //enable all CORS
app.use(express.json());

// Available Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/notes", require("./routes/notes"));

app.listen(port, () => {
  console.log(`iNoteBook Backend listening on port ${port}`);
});

// "version":2,
//     "builds": [
//       { "src": "*.js", "use": "@vercel/node" }
//     ],
//     "routes": [
//         {
//           "src": "/(.*)",
//           "dest": "/"
//         }
//     ],
