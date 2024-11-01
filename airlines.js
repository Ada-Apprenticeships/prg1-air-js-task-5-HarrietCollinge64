const fs = require('fs');

function readCsv(filename, delimiter = ',') {
    try {
        const fileContent = fs.readFileSync(filename, { encoding: 'utf-8' });
        const rows = fileContent.split('\n');
        const data = [];

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i].trim();
            if (row) {
                const columns = row.split(delimiter);
                data.push(columns);
            }
        }
        return data;
    } catch (err) {
        console.error("Error reading file:", err.message);
        return null;
    }
}

//class to represent a flight
class Flight {
    constructor(ukAirport, overseasAirport, profit, aircraft) {
        this.ukAirport = ukAirport; 
        this.overseasAirport = overseasAirport;
        this.profit = profit;
        this.aircraft = aircraft;
    }
    // method to append flight details to txt file
    appendToFile(file) {
        fs.appendFileSync(file, `The flight from ${this.ukAirport} to ${this.overseasAirport} using a ${this.aircraft}, with the given seat bookings and prices would result in a profit of £${this.profit} \n`, "utf-8")
    }
}

const airportsData = readCsv('airports.csv');
const aeroplanesData = readCsv('aeroplanes.csv')
const flightData = readCsv('invalid_flight_data.csv')
const file = "flightDetails.txt"

function main() {

    fs.existsSync(file) ? fs.unlinkSync(file) : false
    
      for(const flight of flightData) {
        if (checkValid(flight)) {
            
            const distance = parseFloat(getDistance(flight))
            const plane = getPlane(flight[2])
            const income = (flight[3] * flight[6]) + (flight[4] * flight[7]) + (flight[5] * flight[8])
            const noOfSeats = parseInt(flight[3])+ parseInt(flight[4]) + parseInt(flight[5])
            const runningCostPerSeatper100km = parseFloat(plane[1].substring(1)) 
            
     
            
            const cost = noOfSeats * (runningCostPerSeatper100km*(distance/100))
            const profit = (income - cost).toFixed(2)
            
            
            const newFlight = new Flight(
                flight[0], // UK airport
                flight[1], // Overseas airport 
                profit, 
                flight[2] // aircraft 
            );
            newFlight.appendToFile(file);
        }
        else{
            fs.appendFileSync(file,"" , "utf-8")
        }
    }
}


function checkValid(flight){
    const plane = getPlane(flight[2])
    const distance = parseInt(getDistance(flight))
    // an array holding the number of seats booked/avaliable for economy, business and first
    const bookedSeats = [
        parseInt(flight[3]),
        parseInt(flight[4]),
        parseInt(flight[5])
    ]
    const avaliableSeats = [
        parseInt(plane[3]),
        parseInt(plane[4]),
        parseInt(plane[5])
    ]
    //creates arrays of valid airport codes
    const overseasAirportsCodes = airportsData.map(airport => airport[0])
    const ukAirportCodes = ['MAN', 'LGW']

   // conditions of flight being valid 
    let reason = bookedSeats[0] > avaliableSeats[0] ? `Economy Class has been over booked by ${bookedSeats[0] - avaliableSeats[0]}`
    : bookedSeats[1] > avaliableSeats[1] ? `Business Class has been over booked by ${bookedSeats[1] - avaliableSeats[1]}` 
    : distance > parseInt(plane[2]) ? `${plane[0]} does not have the range of ${distance}`
    : bookedSeats[2] > avaliableSeats[2] ? `First Class has been over booked by ${bookedSeats[2] - avaliableSeats[2]}`
    : !ukAirportCodes.includes(flight[0]) ? `The airport code ${flight[0]} does not exist`
    : !overseasAirportsCodes.includes(flight[1]) ? `The airport code ${flight[1]} does not exist`
    : "OK"
    
    if (reason === "OK") {return true}
    else{
        console.log(reason)
        return false
    }
}

function getPlane(aircraft){
    for (let i = 0; i < aeroplanesData.length; i++) {
        if(aeroplanesData[i][0] === aircraft){return aeroplanesData[i]}
    }
}
function getDistance(validFlightsData){
    for (let i = 0; i < airportsData.length; i++) {
        if (airportsData[i][0]==validFlightsData[1]) {
            return validFlightsData[0] === "MAN" ? airportsData[i][2] : airportsData[i][3]
        }
    }
}


main()