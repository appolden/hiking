import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class TrailSummary {
    constructor(trailName, activities){
        this.trailName = trailName;
        this.distance = 0;
        this.elapsed_time = 0;
        this.moving_time = 0;
        this.total_elevation_gain = 0;

        activities.forEach(activity =>{
            this.distance += activity.distance;
            this.elapsed_time += activity.elapsed_time;
            this.moving_time += activity.moving_time;
            this.total_elevation_gain += activity.total_elevation_gain;
        });
    }
}

class TrailsSummary extends Component{

    constructor(props) {
        super(props);
        this.state = { trailSummaries: [] };

        fetch('/data/hwp.json')
         .then(response => response.json())
         .then(response => {

             this.setState(function(prevState, props) {
                 let trailSummary = new TrailSummary("hwp", response);
                 prevState.trailSummaries.push(trailSummary);
                 
                 return {trailSummaries : prevState.trailSummaries};
             });
         });


        fetch('/data/pct.json')
        .then(response => response.json())
        .then(response => {

            this.setState(function(prevState, props) {
                let trailSummary = new TrailSummary("pct", response);
                prevState.trailSummaries.push(trailSummary);
                 
                return {trailSummaries : prevState.trailSummaries};
            });
        });

        fetch('/data/gr5.json')
        .then(response => response.json())
        .then(response => {

            this.setState(function(prevState, props) {
                let trailSummary = new TrailSummary("gr5", response);
                prevState.trailSummaries.push(trailSummary);
                 
                return {trailSummaries : prevState.trailSummaries};
            });
        });

    }


    render(){

        const rows = this.state.trailSummaries.map(summary => (
            <div className="row" key={summary.trailName}>
            <div className="col-md12">
                <h3>
                    <Link to={'/trail/' + summary.trailName}>

                    {summary.trailName}</Link>
                </h3>
                        
       
            <ul>
            <li>
            {summary.distance * 0.01} kms {summary.distance * 0.000621371} miles</li>
            <li> Elevation gain {summary.total_elevation_gain} metres</li>
            <li> Moving {summary.moving_time.toHHMM()} hh:mm  </li>
            
            </ul>
            </div>
                </div>
        ));

        return (
            
<React.Fragment>    
    
    <div className="row">
    <div className="col-md12">
    <h1> Trails Summary</h1>
    </div>
    </div>

    {rows} 
    </React.Fragment> );
    }
}

export default TrailsSummary;