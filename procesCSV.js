

const fs = require('fs')
const csv = require('csv-parser')
const Readstream = fs.createReadStream('./uploads/Citylist.csv')
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

myEmitter.on('upload', (db)=> {
    console.log('Emiting an Event')
    Readstream
	.pipe(csv())
	.on("data", async ( chunk )=>{
		console.log( chunk )
		let cityDetails = {
			"slNo" : chunk["Sl. No."] ,
			"city/Town" : chunk["City/Town"] ,
			"UrbanStatus": chunk["Urban Status"] ,
			"StateCode": chunk["State Code"],
			"State/UnionTeritory": chunk["State/                                               Union territory*"],
			"DistrictCode": chunk["District Code"],
			"District": chunk.District
		}
		try {
			await db.collection('CityList').insertOne( cityDetails )
			console.log('#########')			
		} catch (error) {
			console.log('Error while wrting to DB')
		}

	})
	.on("end",()=>{
		console.log('Completed....')

	})
});

module.exports = {
    myEmitter
}
  