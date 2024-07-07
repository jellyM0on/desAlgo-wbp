import stationData from './assets/stationData.json'


const fareMatrix = stationData; 

//computes travel time of a sub path depending on the speed of the vehicle in the system
function computeTravelTime (station, currTravelTime, subPathDistance) {

    if (fareMatrix[station]['systemLine'] === 'EDSA Carousel') {
        currTravelTime += (subPathDistance / 21) * 60;
    }
    else {
        currTravelTime += (subPathDistance / 60) * 60;
    }

    return currTravelTime;
}

//computes fair based on the corresponding line system of the path in fareMatrix json file 
function computeFair (firstFair, secondFair, originStation, destinationStation, currTotalFare, discounted, journeyType) {
    
    switch (fareMatrix[destinationStation]['systemLine']) {

        case 'LRT 1':
        case 'LRT 2':
            if (journeyType === 'beep'){
                currTotalFare += Math.ceil(secondFair);
            }
            else {
                discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += firstFair;
            }
            break;

        case 'MRT 3':
            discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += firstFair;
            break;
        
        case 'EDSA Carousel':
            if (fareMatrix[originStation]['stopOrder'] < fareMatrix[destinationStation]['stopOrder']) {
                discounted? currTotalFare += Math.ceil(firstFair - firstFair * 0.20) : currTotalFare += Math.ceil(firstFair);
            }
            else {
                discounted? currTotalFare += Math.ceil(secondFair - secondFair * 0.20) : currTotalFare += Math.ceil(secondFair);
            }
            break;
    }

    return currTotalFare;
}

function findAllRoutes(origin, destination, typeOfRide, discount) {

    const graph = {
        //LRT 1
        'Fernando Poe Jr./Roosevelt': [['Balintawak (LRT1)', 1.87], ['Roosevelt (Carousel)', 0, 10]],
        'Balintawak (LRT1)': [['Yamaha Monumento', 2.25], ['Fernando Poe Jr./Roosevelt', 1.87], ['Balintawak (Carousel)', 0, 1]], //transfer point
        'Yamaha Monumento': [['5th Avenue', 1.087], ['Balintawak (LRT1)', 2.25], ['Monumento (Carousel)', 0, 10]],
        '5th Avenue': [['R. Papa', 0.954], ['Yamaha Monumento', 1.087]],
        'R. Papa': [['Abad Santos', 0.66], ['5th Avenue', 0.954]],
        'Abad Santos': [['Blumentritt', 0.927], ['R. Papa', 0.66]],
        'Blumentritt': [['Tayuman', 0.671], ['Abad Santos', 0.927]],
        'Tayuman': [['Bambang', 0.618], ['Blumentritt', 0.671]],
        'Bambang': [['Doroteo Jose', 0.648], ['Tayuman', 0.618]],
        'Doroteo Jose': [['Carriedo', 0.685], ['Bambang', 0.648], ['Recto', 0, 3]], //transfer point
        'Carriedo': [['Central Terminal', 0.725], ['Doroteo Jose', 0.685]],
        'Central Terminal': [['United Nations', 1.214], ['Carriedo', 0.725]],
        'United Nations': [['Pedro Gil', 0.754], ['Central Terminal', 1.214]],
        'Pedro Gil': [['Quirino', 0.794], ['United Nations', 0.754]],
        'Quirino': [['Vito Cruz', 0.827], ['Pedro Gil', 0.794]],
        'Vito Cruz': [['Gil Puyat', 1.061], ['Quirino', 0.827]],
        'Gil Puyat': [['Libertad', 0.73], ['Vito Cruz', 1.061]],
        'Libertad': [['EDSA', 1.01], ['Gil Puyat', 0.73]],
        'EDSA': [['Baclaran', 0.588], ['Libertad', 1.01], ['Taft Avenue (MRT3)', 0, 8], ['Taft Avenue (Carousel)', 0, 8]], //transfer point
        'Baclaran': [['EDSA', 0.588]],
    
        //LRT 2
        'Recto': [['Legarda', 1.05], ['Doroteo Jose', 0, 3]], //transfer point
        'Legarda': [['Pureza', 1.389], ['Recto', 1.05]],
        'Pureza': [['V. Mapa', 1.357], ['Legarda', 1.389]],
        'V. Mapa': [['J. Ruiz', 1.234], ['Pureza', 1.357]],
        'J. Ruiz': [['Gilmore', 0.928], ['V. Mapa', 1.234]],
        'Gilmore': [['Betty Go-Belmonte', 1.075], ['J. Ruiz', 0.928]],
        'Betty Go-Belmonte': [['Araneta Center-Cubao (LRT2)', 1.164], ['Gilmore', 1.075]],
        'Araneta Center-Cubao (LRT2)': [['Anonas', 1.438], ['Betty Go-Belmonte', 1.164], ['Araneta Center-Cubao (MRT3)', 0, 7]], //transfer point
        'Anonas': [['Katipunan', 0.955], ['Araneta Center-Cubao (LRT2)', 1.438]],
        'Katipunan': [['Santolan (LRT2)', 1.97], ['Anonas', 0.955]],
        'Santolan (LRT2)': [['Marikina-Pasig', 1.70], ['Katipunan', 1.97]],
        'Marikina-Pasig': [['Antipolo', 2.60], ['Santolan (LRT2)', 1.70]],
        'Antipolo': [['Marikina-Pasig', 2.60]],
    
        //MRT 3
        'North Avenue (MRT3)': [['Quezon Avenue (MRT3)', 1.22], ['North Avenue (Carousel)', 0, 5]], 
        'Quezon Avenue (MRT3)': [['GMA Kamuning', 0.94], ['North Avenue (MRT3)', 1.22], ['Quezon Avenue (Carousel)', 0, 2]], //transfer point
        'GMA Kamuning': [['Araneta Center-Cubao (MRT3)', 1.85], ['Quezon Avenue (MRT3)', 0.94]], 
        'Araneta Center-Cubao (MRT3)': [['Santolan-Annapolis', 1.45], ['GMA Kamuning', 1.85], ['Araneta Center-Cubao (LRT2)', 0, 7]], //transfer point
        'Santolan-Annapolis': [['Ortigas (MRT3)', 2.31], ['Araneta Center-Cubao (MRT3)', 1.45]],
        'Ortigas (MRT3)': [['Shaw Boulevard', 0.77], ['Santolan-Annapolis', 2.31], ['Ortigas (Carousel)', 0, 4]], //transfer point
        'Shaw Boulevard': [['Boni', 0.98], ['Ortigas (MRT3)', 0.77]],
        'Boni': [['Guadalupe (MRT3)', 0.77], ['Shaw Boulevard', 0.98]],
        'Guadalupe (MRT3)': [['Buendia (MRT3)', 1.83], ['Boni', 0.77], ['Guadalupe (Carousel)', 0, 2]], //transfer point
        'Buendia (MRT3)': [['Ayala (MRT3)', 0.88], ['Guadalupe (MRT3)', 1.83], ['Buendia (Carousel)', 0, 4]], //transfer point
        'Ayala (MRT3)': [['Magallanes', 1.19], ['Buendia (MRT3)', 0.88], ['Ayala (Carousel)', 0, 6]],
        'Magallanes': [['Taft Avenue (MRT3)', 1.89], ['Ayala (MRT3)', 1.19]],
        'Taft Avenue (MRT3)': [['Magallanes', 1.89], ['EDSA', 0, 8], ['Taft Avenue (Carousel)', 0, 8]], //transfer point
    
        //EDSA Carousel
        'Monumento (Carousel)': [['Bagong Barrio', 0.55], ['Yamaha Monumento', 0, 10]],
        'Bagong Barrio': [['Balintawak (Carousel)', 1.55], ['Monumento (Carousel)', 0.55]],
        'Balintawak (Carousel)': [['Kaingin Road', 0.80], ['Bagong Barrio', 1.55], ['Balintawak (LRT1)', 0, 1]], //transfer point
        'Kaingin Road': [['Roosevelt (Carousel)', 1.10], ['Balintawak (Carousel)', 0.80]],
        'Roosevelt (Carousel)': [['North Avenue (Carousel)', 1.50], ['Kaingin Road', 1.10], ['Fernando Poe Jr./Roosevelt', 0, 10]],
        'North Avenue (Carousel)': [['Quezon Avenue (Carousel)', 1.30], ['Roosevelt (Carousel)', 1.50], ['North Avenue (MRT3)', 0, 5]], 
        'Quezon Avenue (Carousel)': [['Nepa Q-Mart', 1.80], ['North Avenue (Carousel)', 1.30], ['Quezon Avenue (MRT3)', 0, 2]], //transfer point
        'Nepa Q-Mart': [['Main Avenue', 1.60], ['Quezon Avenue (Carousel)', 1.80]],
        'Main Avenue': [['Santolan (Carousel)', 0.80], ['Nepa Q-Mart', 1.60]],
        'Santolan (Carousel)': [['Ortigas (Carousel)', 2.40], ['Main Avenue', 0.80]],
        'Ortigas (Carousel)': [['Guadalupe (Carousel)', 2.40], ['Santolan (Carousel)', 2.40], ['Ortigas (MRT3)', 0, 4]], //transfer point
        'Guadalupe (Carousel)': [['Buendia (Carousel)', 2.00], ['Ortigas (Carousel)', 2.40], ['Guadalupe (MRT3)', 0, 2]], //transfer point
        'Buendia (Carousel)': [['Ayala (Carousel)', 2.90], ['Guadalupe (Carousel)', 2.00], ['Buendia (MRT3)', 0, 4]], //transfer point
        'Ayala (Carousel)': [['Tramo', 4.20], ['Buendia (Carousel)', 2.90], ['Ayala (MRT3)', 0, 6]],
        'Tramo': [['Taft Avenue (Carousel)', 0.40]],
        'Taft Avenue (Carousel)': [['Roxas Boulevard', 0.80], ['Ayala (Carousel)', 4.70], ['Taft Avenue (MRT3)', 0, 8], ['EDSA', 0, 8]],
        'Roxas Boulevard': [['MOA', 1.30], ['Taft Avenue (Carousel)', 0.80]],
        'MOA': [['DFA/Starbucks', 1.40]],
        'DFA/Starbucks': [['Ayala Malls Manila Bay/City of Dreams', 0.90], ['Roxas Boulevard', 1.10]],
        'Ayala Malls Manila Bay/City of Dreams': [['PITX', 5.30], ['DFA/Starbucks', 0.90]],
        'PITX': [['Ayala Malls Manila Bay/City of Dreams', 5.30]]
    };

    //executes dfs algorithm to find all possible paths from origin station to destination station 
    function implementDFS(currStation, destination, route, visited, allRoutes, finalTotalDistance, subPathDistance, currTotalFare, currTravelTime, routeTransfer, firstStation, prevStation, rideType, isDiscounted) {
       
        route.push(currStation); //places the current visited station in the current route
        visited.add(currStation);
        console.log("Visited: " + currStation);

        let firstFair, secondFair;
        
        if (fareMatrix[currStation]['systemLine'] !== fareMatrix[prevStation]['systemLine']) { //checks if the route switched to another system line

            routeTransfer++; //counts how many times a system line transfer happened in a route

            currTravelTime = computeTravelTime(prevStation, currTravelTime, subPathDistance);

            subPathDistance = 0; 

            for (const [adjacentStation, distance, travelTime] of graph[prevStation]) { //includes the walking time in the travel time when transferring to other system lines
                if (adjacentStation === currStation) {
                    currTravelTime += travelTime;
                }
            }

            if (fareMatrix[firstStation][prevStation]) { //checks if the fare data from origin to destination exist. if not, it swaps the stations. 

                firstFair = fareMatrix[firstStation][prevStation][0];
                secondFair = fareMatrix[firstStation][prevStation][1];

                currTotalFare = computeFair(firstFair, secondFair, firstStation, prevStation, currTotalFare, isDiscounted, rideType);
            }
            else if (fareMatrix[prevStation][firstStation]) {

                firstFair = fareMatrix[prevStation][firstStation][0];
                secondFair = fareMatrix[prevStation][firstStation][1];

                currTotalFare = computeFair(firstFair, secondFair, firstStation, prevStation, currTotalFare, isDiscounted, rideType);
            }

            firstStation = currStation; //sets the current station as the first station of a new subpath
  
        }

        prevStation = currStation; //sets the current station as the previous station before moving on to the next subpath

        if (currStation === destination) {

            if (firstStation !== destination) { //prevents the first station from recalculating previous subpath if it is already the destination

                currTravelTime = computeTravelTime(prevStation, currTravelTime, subPathDistance);

                subPathDistance = 0;

                if (fareMatrix[firstStation][currStation]) {

                    firstFair = fareMatrix[firstStation][currStation][0];
                    secondFair = fareMatrix[firstStation][currStation][1];

                    currTotalFare = computeFair(firstFair, secondFair, firstStation, currStation, currTotalFare, isDiscounted, rideType);
                }
                else if (fareMatrix[currStation][firstStation]) {

                    firstFair = fareMatrix[currStation][firstStation][0];
                    secondFair = fareMatrix[currStation][firstStation][1];

                    currTotalFare = computeFair(firstFair, secondFair, firstStation, currStation, currTotalFare, isDiscounted, rideType);
                }
            }
            
            currTravelTime += (route.length - routeTransfer - 1) * 0.5; //takes the loading and unloading time in each stations stop into consideration

            allRoutes.push({ //includes the route in the list of possible routes
                route: [...route],
                finalTotalDistance: finalTotalDistance.toFixed(2),
                finalTravelTime: Math.ceil(currTravelTime), 
                finalTotalFair: currTotalFare,
                numStations: route.length - 1
            });

        } 
        else {

            for (const [adjacentStation, distance, travelTime] of graph[currStation]) { //checks unvisited adjacent stations from the current station

                if (!visited.has(adjacentStation)) { //if the adjacent station is not yet visited, we visit deeper into the path
                    implementDFS(adjacentStation, destination, route, visited, allRoutes, finalTotalDistance + distance, subPathDistance + distance, currTotalFare, currTravelTime, routeTransfer, firstStation, prevStation, rideType, isDiscounted);
                }
            }
        }

        route.pop(); //backtracks to the station with unvisited adjacent stations
        visited.delete(currStation);
    }

    let allRoutes = [];
    let firstStation = origin;
    let prevStation = origin;

    implementDFS(origin, destination, [], new Set(), allRoutes, 0, 0, 0, 0, 0, firstStation, prevStation, typeOfRide, discount);
    
    return allRoutes;
}


export default findAllRoutes; 
