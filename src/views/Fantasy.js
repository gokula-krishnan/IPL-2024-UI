import React, { Component } from 'react';

import CanvasJSReact from '../assets/canvasjs.react';

import * as teams from "../assets/AuctionTeams.json";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import {
  BrowserRouter
} from "react-router-dom";

import ReactTable from 'react-table-6'
import 'react-table-6/react-table.css'

var CanvasJSChart = CanvasJSReact.CanvasJSChart;

class Fantasy extends Component {
	teamIdMap = {
		4343: "CSK",
		4344: "DC",
		6904: "GT",
		6903: "LSG",
		4342: "PBKS",
		4341: "KKR",
		4346: "MI",
		4345: "RR",
		4340: "RCB",
		5143: "SRH"	
	}
	playerIdToPointsMap = {};
	playerIdToRunsMap = {};
	playerIdToWicketsMap = {};
	playerIdToFoursMap = {};
	playerIdToSixesMap = {};
	playerIdToCatchesMap = {};
	playerIdToNameMap = {};

	playerTableColumns = [	  
		{
			Header: "PlayerName",
			accessor: "name"
		},
		{
			Header: "Matches",
			accessor: "matches"
		},
		{
			Header: "Points",
			accessor: 'points',
			defaultSortDesc: true
		}
  	];

	constructor(props) {
		super(props);
		this.state = {
			hideTeamsPointsTable: false,
			selectedTeamName: "",
			hidePlayerPointsTable: false,
			selectedPlayerId: 0,
			playerPoints: null,
		};
	}

	componentDidMount() {
		fetch("https://gist.githubusercontent.com/gokula-krishnan/470ed48ea52e4efa8c0609e2f3fdf560/raw/ad2eef3be3678e4de5349223162c35239cf27ce5/ipl2024-player-points.json")
		.then((res) => res.json())
		.then((json) => {
			this.setState({
				playerPoints: json
			});
		})
	}

	  
	_getTeamPoints(players, teams) {
		this.playerIdToPointsMap = {};

		players.forEach((player) => {
			let points = player["totalPoints"];
			if (player["scores"] && player["scores"].length > 0) {
				player["scores"].forEach((score) => {
					if (score["isMOTM"]) {
						points += 25;
					}
				});
			}
			this.playerIdToPointsMap[player["id"]] = points;
		});

		let data = []

		teams.forEach((team) => {
			let points = 0;
			let playerIds = team["players"];

			playerIds.forEach((id) => {
				if(this.playerIdToPointsMap[id] !== undefined)
				{
					points = points + this.playerIdToPointsMap[id];
				}
			});
			
			data.push({
				"name": team["name"],
				"points": points
			});
		});

		data.sort((a,b) => {
			return b["points"] - a["points"];
		})

		return data;
	}

	_getPlayersTable() {
		let teamPlayerIds = "";

		teams["teams"].forEach((team) => {
			if (this.state.selectedTeamName === team["name"]) {
				teamPlayerIds = team["players"];
			}
		});

		let teamPlayerData = [];

		this.state.playerPoints["Players"].forEach((player) => {
			if (teamPlayerIds.includes(player["id"])) {
				let motmPoints = 0;
				if (player["scores"] && player["scores"].length > 0) {
					player["scores"].forEach((score) => {
						if (score["isMOTM"]) {
							motmPoints += 25;
						}
					});
				}
				teamPlayerData.push({
					"id": player["id"],
					"name": player["name"],
					"matches": player["scores"].length,
					"points": player["totalPoints"] + motmPoints
				});
			}
		});

		teamPlayerData.sort((a,b) => {
			return b["points"] - a["points"];
		})

		return (
			<>
				<center>
					<div style={{
							"margin-top": "5%",
							"font-weight": "bold",
							"font-size": "30px"
						}}>
						{this.state.selectedTeamName}
					</div>
				</center>
				<ReactTable
					style={{
						"margin-top": "20px",
					}}
					columns={this.playerTableColumns}
					minRows={15}
					data={teamPlayerData} 
					getTrProps={(state, rowInfo, column, instance) => {
						return {
							onClick: (e, handleOriginal) => {
								this.setState({
									hidePlayerPointsTable: true,
									selectedPlayerId: rowInfo["original"]["id"]
								})
							},
							style: {
								cursor: "pointer"
							}
						}
					}} />
				<center>
					<button onClick={() => {
						this.setState({
							hideTeamsPointsTable: false,
							selectedTeamName: ""
						});
						
					}}
					style={{
						"margin-top": "10px",
					}}>
						Back
					</button>
				</center>
			</>
		);
	}

	_populatePlayerWiseStats() {
		let playerList = this.state.playerPoints["Players"];
		this.playerIdToRunsMap = {};
		this.playerIdToWicketsMap = {};
		this.playerIdToSixesMap = {};
		this.playerIdToFoursMap = {};
		this.playerIdToCatchesMap = {};
		this.playerIdToMotmMap = {};
		this.playerIdToNameMap = {};

		playerList.forEach((player) => {
			let runs = 0;
			let wickets = 0;
			let fours = 0;
			let sixes = 0;
			let catches = 0;
			let motms = 0;

			this.playerIdToNameMap[player["id"]] = player["name"];
			player.scores.forEach((score) => {
				if (score["battingPerformance"] !== undefined && score["battingPerformance"]["runs"] !== undefined) {
					runs = runs + score["battingPerformance"]["runs"];
					fours = fours + score["battingPerformance"]["fours"];
					sixes = sixes + score["battingPerformance"]["sixes"];
				}

				if (score["bowlingPerformance"] !== undefined && score["bowlingPerformance"]["wickets"] !== undefined) {
					wickets = wickets + score["bowlingPerformance"]["wickets"];
				}

				if (score["fieldingPerformance"] !== undefined && score["fieldingPerformance"]["catches"] !== undefined) {
					catches = catches + score["fieldingPerformance"]["catches"];
				}

				if (score["isMOTM"] === true) {
					motms ++ ;
				}
			});
			this.playerIdToRunsMap[player["id"]] = runs;
			this.playerIdToWicketsMap[player["id"]] = wickets;
			this.playerIdToFoursMap[player["id"]] = fours;
			this.playerIdToSixesMap[player["id"]] = sixes;
			this.playerIdToCatchesMap[player["id"]] = catches;
			this.playerIdToMotmMap[player["id"]] = motms;
		});
	}

	_getToolTipContent(label, playerIdToCountMap) {
		let teamList = teams["teams"];
		let toolTip = "";

		teamList.forEach((team) => {
			if (team["name"] === label) {
				team["players"].forEach((player) => {
					if (playerIdToCountMap[player] !== undefined) {
						toolTip = toolTip + this.playerIdToNameMap[player] + " : " + playerIdToCountMap[player] + "<br>";
					}
				});
			}
		});

		return toolTip;
	}

	_getGraphOptions(playerIdToCountMap) {
		let teamList = teams["teams"];
		let chartPoints = [];

		teamList.forEach((team) => {
			let count = 0;
			team.players.forEach((player) => {
				if (playerIdToCountMap[player] !== undefined) {
					count = count + playerIdToCountMap[player];
				}
			});

			chartPoints.push({
				"y": count,
				"label": team.name
			});
		});

		const options = {
			animationEnabled: true,
			theme: "light2",
			axisX: {
				title: "Teams",
				reversed: true,
			},
			toolTip: {
				content: this._getToolTipContent("a", playerIdToCountMap)
			},
			axisY: {
				title: "Values"
			},
			data: [{
				type: "bar",
				dataPoints: chartPoints
			}]
		}
		
		return options;
	}

	_getGraphView(text, graphOptions) {
		return (
			<>
				<center>
					<div style={{
						"margin-top": "5%",
						"font-weight": "bold",
						"font-size": "20px"
					}}>
						{text}
							</div>
				</center>

				<CanvasJSChart options={graphOptions} />
			</>
		);
	}

	_getTeamsPage(data, columns) {
		this._populatePlayerWiseStats();
		let teamWiseRunsGraphOptions = this._getGraphOptions(this.playerIdToRunsMap);
		let teamWiseWicketsGraphOptions = this._getGraphOptions(this.playerIdToWicketsMap);
		let teamWiseFoursGraphOptions = this._getGraphOptions(this.playerIdToFoursMap);
		let teamWiseSixesGraphOptions = this._getGraphOptions(this.playerIdToSixesMap);
		let teamWiseCatchesGraphOptions = this._getGraphOptions(this.playerIdToCatchesMap);
		let teamWiseMotmGraphOptions = this._getGraphOptions(this.playerIdToMotmMap);
		return (
			<>
				<center>
					<div style={{
							"margin-top": "5%",
							"font-weight": "bold",
							"font-size": "20px"
						}}>
						Leaderboard
					</div>
				</center>
				<ReactTable
					style={
						{
							"margin-top": "10px",
							 "font-weight": "bold"
						}
					}
					data={data}
					columns={columns}
					minRows={10}
					showPagination={false}
					defaultSorting={[
						{
							id: "points",
							desc: true
						}
					]}
					getTrProps={(state, rowInfo, column, instance) => {
						return {
							onClick: (e, handleOriginal) => {
								this.setState({
									hideTeamsPointsTable: true,
									selectedTeamName: rowInfo["row"]["name"]
								});
							},
							style: {
								cursor: "pointer"
							}
						}
					}} />
					{this._getGraphView("Runs-Scored", teamWiseRunsGraphOptions)}
					{this._getGraphView("Wickets-Taken", teamWiseWicketsGraphOptions)}
					{this._getGraphView("Fours-Scored", teamWiseFoursGraphOptions)}
					{this._getGraphView("Sixes-Scored", teamWiseSixesGraphOptions)}
					{this._getGraphView("Catches-Taken", teamWiseCatchesGraphOptions)}
					{this._getGraphView("Man of the Matches", teamWiseMotmGraphOptions)}
			</>
		);
	}

	_getPlayerGraphOption(player) {

		let battingPerfList = [];
		let bowlingPerfList = [];
		let fieldingPerfList = [];

		let battingPoints = 0;
		let bowlingPoints = 0;
		let fieldingPoints = 0;

		player["scores"].forEach((score) => {
			battingPerfList.push({
				"label": this.teamIdMap[score['opponentTeamId']],
				"y": score["battingPoints"]
			});

			bowlingPerfList.push({
				"label": this.teamIdMap[score['opponentTeamId']],
				"y": score["bowlingPoints"]
			});

			fieldingPerfList.push({
				"label": this.teamIdMap[score['opponentTeamId']],
				"y": score["fieldingPoints"]
			});

			battingPoints += score["battingPoints"];
			bowlingPoints += score["bowlingPoints"];
			fieldingPoints += score["fieldingPoints"];
		});

		const options = {
			animationEnabled: true,
			exportEnabled: false,
			title: {
				text: "Matchwise points of " + player["name"],
				fontFamily: "verdana"
			},
			axisY: {
				title: "Points"
			},
			axisX: {
				title: "Opponent"
			},
			toolTip: {
				shared: true,
				reversed: true
			},
			legend: {
				verticalAlign: "center",
				horizontalAlign: "right",
				reversed: true,
				cursor: "pointer"
			},
			data: [
			{
				type: "stackedColumn",
				name: "Batting",
				showInLegend: true,
				dataPoints: battingPerfList
			},
			{
				type: "stackedColumn",
				name: "Bowling",
				showInLegend: true,
				dataPoints: bowlingPerfList
			},
			{
				type: "stackedColumn",
				name: "Fielding",
				showInLegend: true,
				dataPoints: fieldingPerfList
			}]
		}

		return [options, battingPoints, bowlingPoints, fieldingPoints];
	}

	_getPlayerDistributionGraphOption(battingPoints, bowlingPoints, fieldingPoints, player) {
		const options = {
			animationEnabled: true,
			title: {
				text: "Overall point distribution"
			},
			subtitles: [{
				text: player["name"],
				verticalAlign: "center",
				fontSize: 20,
				dockInsidePlotArea: true
			}],
			data: [{
				type: "doughnut",
				showInLegend: true,
				indexLabel: "{name}: {y}",
				dataPoints: [
					{ name: "Batting", y: battingPoints },
					{ name: "Bowling", y: bowlingPoints },
					{ name: "Fielding", y: fieldingPoints }
				]
			}]
		}

		return options;
	}

	_getPlayerDetailView() {

		let players = this.state.playerPoints["Players"];
		let currentSelectedPlayer = {};
		
		players.forEach((player) => {
			if (player["id"] === this.state.selectedPlayerId) {
				currentSelectedPlayer = player;
				return;
			}
		});

		let returnValue = this._getPlayerGraphOption(currentSelectedPlayer);

		let playerGraphOptions = returnValue[0];
		let distributionGraphOptions = this._getPlayerDistributionGraphOption(returnValue[1], returnValue[2], returnValue[3], currentSelectedPlayer);

		return(
			<>
			<div style={{"margin-top" : "10%"}} />
			
			<CanvasJSChart 
				options={playerGraphOptions} />

			
			<div style={{"margin-top" : "4%"}} />
			
			<CanvasJSChart 
				options={distributionGraphOptions} />
			
			<center>
				<button onClick={() => {
						this.setState({
							hidePlayerPointsTable: false,
							selectedPlayerId: 0
						});
						
					}}
					style={{
						"margin-top": "10px",
					}}>
						Back
					</button>
			</center>
			</>
		);
	}

  	render() {
	  if (this.state.playerPoints === null) {
		return <></>
	  }

	  let players = this.state.playerPoints["Players"];   
	  let teamList = teams["teams"];
	  const columns = [	  
			{
				Header: "Team",
				accessor: "name"
			},
			{
				Header: "Points",
				accessor: 'points',
				defaultSortDesc: true
			}
	  ];
	  
	  let data = this._getTeamPoints(players, teamList);

    return (
		<div>
			<Navbar bg="dark" variant="dark">
				<Navbar.Brand href="/">
					IPL - 2023
				</Navbar.Brand>
			  </Navbar>		  
			  <BrowserRouter>		  
					<Row>				
						<Col xl={{ span: 7, offset: 3 }} lg={{ span: 8, offset: 3 }} xs={{ span: 8, offset: 2 }}>
							<Container>
								<div className="content">
									{
										!this.state.hideTeamsPointsTable && this._getTeamsPage(data, columns)
									}
									{
										this.state.hideTeamsPointsTable && !this.state.hidePlayerPointsTable && this._getPlayersTable()
									}
									{
										this.state.hidePlayerPointsTable && this._getPlayerDetailView()
									}								
									
								</div>
							</Container>
						</Col>					
					</Row>			
			  </BrowserRouter>	
			</div>
    );
  }
}

export default Fantasy;