const fs = require('fs');
const path = require('path');

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


class Flight {
    constructor(ukAirport, overseasAirport, profit, aircraft) {
        this.ukAirport = ukAirport; 
        this.overseasAirport = overseasAirport;
        this.profit = profit;
        this.aircraft = aircraft;
    }
    appendToFile(file) {
        fs.appendFileSync(file, `The flight from ${this.ukAirport} to ${this.overseasAirport} using a ${this.aircraft}, with the given seat bookings and prices would result in a profit of £${this.profit} \n`, "utf-8")
    }
}

const airportsData = readCsv('airports.csv');
const aeroplanesData = readCsv('aeroplanes.csv')
const validFlightsData = readCsv('valid_flight_data.csv')
const file = "flightDetails.txt"


fs.existsSync(file) ? fs.unlinkSync(file) : false
for (let x = 0; x < validFlightsData.length; x++) {
    let flight = validFlightsData[x]
    if (checkValid(flight)) {
        let profit
        let income = (flight[3] * flight[6]) + (flight[4] * flight[7]) + (flight[5] * flight[8])
        let noOfSeats = parseInt(flight[3])+ parseInt(flight[4]) + parseInt(flight[5])
        
        let cost // = total seats + (cost per seat per 100 km * distance/100km)
        
        let distance = getDistance(flight)
        let plane = getPlane(flight[2])
        
        let runningCostPerSeatper100km = parseFloat(plane[1].substring(1))
        distance = parseFloat(distance)
        noOfSeats = parseFloat(noOfSeats)
        
        cost = noOfSeats * (runningCostPerSeatper100km*(distance/100))
        profit = (income - cost).toFixed(2)
        
        
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

function checkValid(flight){
    let plane = getPlane(flight[2])
    let distance = parseInt(getDistance(flight))
    
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

    const conditions = [
        bookedSeats[0] <= avaliableSeats[0],
        bookedSeats[1] <= avaliableSeats[1],
        bookedSeats[2] <= avaliableSeats[2],
        distance <= parseInt(plane[2])
    ]

    return conditions.every(Boolean)
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


