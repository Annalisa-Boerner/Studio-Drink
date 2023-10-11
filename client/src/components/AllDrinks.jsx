import FavoriteButton from "./FavoriteButton";
import * as React from "react";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { alpha, styled } from "@mui/material/styles";
import { pink } from "@mui/material/colors";
import { useState, useEffect } from "react";
import { fetchAllDrinks } from "../../fetching/local";
import { fetchAllAlcDrinks } from "../../fetching/cocktaildb";
import { fetchAllNonAlcDrinks } from "../../fetching/cocktaildb";

import Box from "@mui/material/Box";
import { Pagination, Typography } from "@mui/material";

const List = styled("ul")({
	listStyle: "none",
	padding: 0,
	margin: 0,
	display: "flex",
});

import DetailsButton from "./DetailsButton";

export default function AllDrinks({ token, userId }) {
	const [allDrinks, setAllDrinks] = useState([]);
	const [allAlcDrinks, setAllAlcDrinks] = useState([]);
	const [allNonAlcDrinks, setAllNonAlcDrinks] = useState([]);
	const [searchParam, setSearchParam] = useState("");
	const [localArray, setLocalArray] = useState([]);
	const [APIArrayBig, setAPIArrayBig] = useState([]);
	const [combinedArray, setCombinedArray] = useState([]);
	const [isToggled, setIsToggled] = useState(false);
	const [alcIds, setAlcIds] = useState([]);

	// Pagination states
	const [page, setPage] = useState(1);
	const [startIndex, setStartIndex] = useState(0);
	const [endIndex, setEndIndex] = useState(18);
	const [totalPages, setTotalPages] = useState(1);
	const [APIArrayBigToDisplay, setAPIArrayBigToDisplay] = useState([]);
	const perPage = 18; // 18 items per page

	useEffect(() => {
		async function getAllDrinks() {
			const drinks = await fetchAllDrinks();
			//    console.log("drinks ", drinks);
			//can also be a try/catch for more detailed error reporting
			if (drinks) {
				setAllDrinks(drinks);

				return drinks;
			} else {
				console.log("error fetching drinks");
			}
		}
		getAllDrinks();
	}, []);

	// getting all alc drinks from Cocktail DB
	useEffect(() => {
		async function getAllAlcDrinks() {
			const drinks = await fetchAllAlcDrinks();
			//    console.log("alc drinks", drinks);
			//can also be a try/catch for more detailed error reporting
			if (drinks) {
				setAllAlcDrinks(drinks.drinks);
			} else {
				console.log("error fetching alcoholic drinks");
			}
		}
		getAllAlcDrinks();
	}, []);

	// getting all non alc drinks from Cocktail DB
	useEffect(() => {
		async function getAllNonAlcDrinks() {
			const drinks = await fetchAllNonAlcDrinks();
			//    console.log("non alc drinks", drinks);
			//can also be a try/catch for more detailed error reporting
			if (drinks) {
				setAllNonAlcDrinks(drinks.drinks);
			} else {
				console.log("error fetching non-alcoholic drinks");
			}
		}
		getAllNonAlcDrinks();
	}, []);

	// combining API alcoholic & nonalcoholic to get all API drinks
	useEffect(() => {
		// console.log("allAlcDrinks in UE", allAlcDrinks);
		// console.log("allNonAlcDrinks in UE", allNonAlcDrinks);
		const twoArrays = allAlcDrinks.concat(allNonAlcDrinks);
		//   console.log("twoArrays", twoArrays);
		setCombinedArray(twoArrays);
	}, [allAlcDrinks, allNonAlcDrinks]);

	function handleSwitch(event) {
		setIsToggled(event.target.checked);
	}

	// calculating total pages
	useEffect(() => {
		console.log("APIArray in useEffect", APIArrayBig);
		console.log("localArray in useEffect", localArray);

		if (APIArrayBig && localArray) {
			let totalBothLength = APIArrayBig.length + localArray.length;
			console.log("API + local arrays length", totalBothLength);
			setTotalPages(Math.ceil(totalBothLength / perPage));
		}
	}, [APIArrayBig, localArray]);

	// Alcohol toggle
	const PinkSwitch = styled(Switch)(({ theme }) => ({
		"& .MuiSwitch-switchBase.Mui-checked": {
			color: pink[600],
			"&:hover": {
				backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
			},
		},
		"& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
			backgroundColor: pink[600],
		},
	}));

	// local DB array splitting alcoholic/non-alcoholic
	const nonAlcArray = [];
	useEffect(() => {
		allDrinks.filter((drink) => {
			// filtering alcoholic drinks
			if (drink.alcoholic && isToggled) {
				setLocalArray(allDrinks);
			} else if (!drink.alcoholic && !isToggled) {
				nonAlcArray.push(drink);
				// console.log("nonAlcArray", nonAlcArray);
				setLocalArray(nonAlcArray);
			}
		});
	}, [allDrinks, isToggled]);

	// API array based on the toggle behavior
	const APIArray = [];
	useEffect(() => {
		//   console.log("combinedArray in UE", combinedArray);
		//   console.log("allNonAlcDrinks in UE", allNonAlcDrinks);
		// console.log("APIArray in UE", APIArray);
		// setAPIArray(nonAlcArray);
		if (isToggled) {
			APIArray.push(combinedArray);
			setAPIArrayBig(APIArray[0]);
			console.log("APIArray if isToggled", APIArray);
		} else if (!isToggled) {
			APIArray.push(allNonAlcDrinks);
			setAPIArrayBig(APIArray[0]);
			console.log("APIArray if !isToggled", APIArray);
		}

		// set first render array
		setAPIArrayBigToDisplay(APIArray[0].slice(0, perPage));
		// set total pages for pagination in return
		setTotalPages(Math.ceil(APIArray[0].length / perPage));
	}, [combinedArray, isToggled, allNonAlcDrinks]);

	// console.log("all alc drinks line 134", allAlcDrinks);

	//pushing the ids from alcoholic drinks into an array
	const alcIdArray = [];
	useEffect(() => {
		for (let i = 0; i < allAlcDrinks.length; i++) {
			alcIdArray.push(allAlcDrinks[i].idDrink);
		}
		// console.log("alcIdArray inside UE", alcIdArray);
		setAlcIds(alcIdArray);
	}, [allAlcDrinks]);

	const drinksToDisplay = searchParam
		? localArray.filter(
				(drink) =>
					drink.drinks_name.toLowerCase().includes(searchParam) ||
					drink.ingredients.toLowerCase().includes(searchParam)
		  )
		: localArray;

	const drinksToDisplayAPI = searchParam
		? APIArrayBigToDisplay.filter((drink) =>
				drink.strDrink.toLowerCase().includes(searchParam)
		  )
		: APIArrayBigToDisplay;

	// console.log("allAlcDrinks above return", allAlcDrinks);
	// console.log("drinks to display api", drinksToDisplayAPI);

	// HANDLES PAGINATION BEHAVIOR FOR LAZY LOADING
	// const [APICounter, setAPICounter] = useState(0);
	// const [localCounter, setLocalCounter] = useState(0);
	const handleChange = (event, pageNum) => {
		setPage(pageNum);
		console.log("page", pageNum);
		console.log("totalPages", totalPages);

		let localLength = localArray.length;
		let localPages = Math.ceil(localLength / perPage); // number of the page where API & localArray begin to join
		let APILength = APIArrayBig.length;

		console.log("localLength", localLength);
		console.log("localPage", localPages);
		console.log("APILength", APILength);

		// console.log("totalLength", totalLength);
		if (pageNum === 1 && !isToggled) {
			// page 1 behavior for toggle off
			console.log("Case 0A");
			if (localLength < perPage) {
				// less than 18 local nonalc drinks
				console.log("Case 0A1");
				let currentLocalArray = localArray.slice(0, localLength);
				let currentAPIArray = APIArrayBig.slice(0, perPage - localLength);
				let currentPageArray = currentLocalArray.concat(currentAPIArray);
				console.log("currentPageArray case 0", currentPageArray);
				setAPIArrayBigToDisplay(currentPageArray);
			} else if (localLength > perPage) {
				// more than 18 local nonalc drinks
				console.log("Case 0A2");
				let currentPageArray = localArray.slice(0, perPage);
				setAPIArrayBigToDisplay(currentPageArray);
			}
		} else if (pageNum === 1 && isToggled) {
			// page 1 behavior for toggle on
			console.log("Case 0B");
			if (localLength < perPage) {
				// less than 18 local nonalc drinks
				let currentLocalArray = localArray.slice(0, localLength);
				let currentAPIArray = APIArrayBig.slice(0, perPage - localLength);
				let currentPageArray = currentLocalArray.concat(currentAPIArray);
				console.log("currentPageArray case 0", currentPageArray);
				setAPIArrayBigToDisplay(currentPageArray);
			} else if (localLength > perPage) {
				// more than 18 local nonalc drinks
				let currentPageArray = localArray.slice(0, perPage);
				setAPIArrayBigToDisplay(currentPageArray);
			}
		} else if (pageNum > 1 && pageNum < totalPages) {
			// 1 < page < totalPages
			if (pageNum < localPages) {
				console.log("case 1");
				// if still within localArray length
				let currentPageArray = localArray.slice(
					(pageNum - 1) * perPage,
					pageNum * perPage
				);
				setAPIArrayBigToDisplay(currentPageArray);
				// setLocalCounter(localLength - perPage);
			} else if (pageNum === localPages) {
				console.log("case 2");
				// last page of localArray, start to join local drinks with API array drinks to be displayed
				let currentArrayLocal = localArray.slice(
					(pageNum - 1) * perPage,
					localLength
				);
				let currentArrayAPI = APIArrayBig.slice(
					0,
					perPage - currentArrayLocal.length
				);
				let currentPageArray = currentArrayLocal.concat(currentArrayAPI);
				setAPIArrayBigToDisplay(currentPageArray);
			} else if (pageNum === localPages + 1) {
				console.log("case 3");
				// first full page of API array (no more localArrray)
				let APIStartIndex = localLength % perPage;
				let currentPageArray = APIArrayBig.slice(
					APIStartIndex,
					APIStartIndex + perPage
				);
				// setAPICounter(APICounter + perPage);
				setAPIArrayBigToDisplay(currentPageArray);
			} else if (pageNum > localPages) {
				console.log("case 4");
				// outside the bounds of the localArray by at least 1 page
				let APIStartIndex =
					(localLength % perPage) + (pageNum - localPages - 1) * perPage;
				let APIEndIndex =
					(localLength % perPage) + (pageNum - localPages) * perPage;
				let currentPageArray = APIArrayBig.slice(APIStartIndex, APIEndIndex);
				setAPIArrayBigToDisplay(currentPageArray);
			} else if (pageNum === totalPages) {
				console.log("case 5");
				// behavior for the last page
				let APIStartIndex =
					APILength -
					(localLength % perPage) +
					(pageNum - localPages) * perPage;
				let currentPageArray = APIArrayBig.slice(APIStartIndex, APILength);
				setAPIArrayBigToDisplay(currentPageArray);
			}
		}
	};

	return (
		<>
			<section id="all-drinks-container">
				<h1>All Drinks</h1>
				<p>🍸 Drink Contains Alcohol</p>
				<FormGroup>
					<FormControlLabel
						control={
							<PinkSwitch
								checked={isToggled}
								onChange={(event) => handleSwitch(event)}
							/>
						}
						label="Show alcoholic drinks"
					/>
				</FormGroup>
				<label>
					<h2>Search: </h2>
					<input
						id="formInput"
						className="inputField"
						type="text"
						placeholder="Search all drinks"
						onChange={(e) => setSearchParam(e.target.value.toLowerCase())}
					/>
				</label>
				<div id="pagination">
					<Pagination
						count={totalPages}
						page={page}
						onChange={handleChange}
						color="primary"
					/>
				</div>
				<div id="all-drinks-gallery">
					{drinksToDisplay.map((drink) => {
						const localDrinkId = drink.drinks_id;
						return (
							<div id="flip-card" key={drink.drinks_id}>
								<div id="flip-card-inner">
									<div id="flip-card-front">
										<p>
											{drink.alcoholic == true ? (
												<text>
													🍸
													{drink.drinks_name}
												</text>
											) : (
												<text>{drink.drinks_name}</text>
											)}
											{/* conditionally render edit button if user id is == the creator's id*/}
										</p>
										<img
											src={drink.image}
											alt={drink.drinks_name}
											id="images"
										/>
									</div>
									<div id="flip-card-back">
										<h1>{drink.drinks_name}</h1>
										{token && (
											<FavoriteButton
												drinkId={drink.drinks_id}
												userId={userId}
											/>
										)}
										<DetailsButton drinkId={localDrinkId} />
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div id="all-drinks-gallery">
					{drinksToDisplayAPI.map((drink) => {
						const APIDrinkId = drink.idDrink;
						return (
							<div id="flip-card" key={drink.idDrink}>
								<div id="flip-card-inner">
									<div id="flip-card-front">
										<div id="name section">
											{alcIds.includes(drink.idDrink) ? (
												<p>
													🍸
													{drink.strDrink}
												</p>
											) : (
												<p>{drink.strDrink}</p>
											)}
										</div>

										<img
											src={drink.strDrinkThumb}
											alt={drink.strDrink}
											id="images"
										/>
									</div>
									<div id="flip-card-back">
										<h1>{drink.strDrink}</h1>
										{token && (
											<FavoriteButton
												api_drinks_id={drink.idDrink}
												userId={userId}
											/>
										)}
										<DetailsButton drinkId={APIDrinkId} />
									</div>
								</div>
							</div>
						);
					})}
				</div>
				<div id="pagination">
					<Pagination
						count={totalPages}
						page={page}
						onChange={handleChange}
						color="primary"
					/>
				</div>
			</section>
		</>
	);
}
