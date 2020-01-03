
const express = require('express')
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

const mongodb = require('mongodb').MongoClient;
const port = process.env.PORT || 80;
const { myEmitter } = require('./procesCSV')
var multer = require('multer')
var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '.csv')
	}
})
var upload = multer({ storage: storage });
const url = "mongodb+srv://madhu:1234@cluster0-wntq1.mongodb.net/test?retryWrites=true&w=majority"
const dbName = "NodeTest";
let db;




//middlewares
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
app.use(cors());





//monogdb connection
mongodb.connect(url, { useUnifiedTopology: true }, (err, client) => {
	console.log("Connected successfully to DB server");
	if (err) {
		console.log('Error Connecting to DB')
		process.exit(1);
	}
	db = client.db(dbName);

});


app.get('/', function (req, res) {
	res.send('City List Api')
})


//Route for uploading a csv file, it will save all the documents in to db
app.post('/uploadCSV', upload.single('Citylist'), (req, res) => {

	myEmitter.emit('upload', db)
	res.send('File Uploaded');

})


//filtering according to state, /state?state="Kerala"
app.get('/state', async (req, res) => {
	try {
		let query = [
			{ $match: { "State/UnionTeritory": req.query.state } },
			{
				$project: {
					_id: 1,
					"State/UnionTeritory": 1,
					DistrictCode: 1,
					District: 1
				}
			}
		]
		let citys_inState = await db.collection('CityList').aggregate(query).toArray()

		return res.status(200).json({
			citys_inState: citys_inState
		})
	} catch (error) {
		return res.status(400).json({
			error: error.message
		})
	}
})

//filtering according to town, /town?town="..."
app.get('/town', async (req, res) => {
	try {
		let query = [
			{ $match: { "city/Town": req.query.town } },
			{
				$project: {
					"city/Town": 1,
					"State/UnionTeritory": 1,
					"District": 1
				}
			}
		]
		let townDetails = await db.collection('CityList').aggregate(query).toArray()
		return res.status(200).json({
			townDetails: townDetails
		})
	} catch (error) {
		return res.status(400).json({
			error: error.message
		})
	}
})


//filtering according to district, /district?district="..."
app.get('/district', async (req, res) => {
	try {
		let query = [
			{ $match: { District: req.query.district } },
			{
				$project: {
					_id: 0
				}
			}
		]
		let distrct_details = await db.collection('CityList').aggregate(query).toArray()
		return res.status(200).json({
			distrct_details: distrct_details
		})
	} catch (error) {
		return res.status(400).json({
			error: error.message
		})
	}
})



app.listen(port, () => {
	console.log('Server Running on post ' + port);
})