import React, { useEffect, useState } from 'react'
import Calendar from 'rc-year-calendar'
import './Dashboard.css'

const Dashboard = () => {
	const [selectedDates, setSelectedDates] = useState([])
	const [controlTimeRange, setControlTimeRange] = useState()

	useEffect(() => {
		const handleContextmenu = (e) => {
			e.preventDefault()
		}
		document.addEventListener('contextmenu', handleContextmenu)
		return function cleanup() {
			document.removeEventListener('contextmenu', handleContextmenu)
		}
	}, [])

	const handleRightClickDay = (rangeInfo) => {
		if (rangeInfo.events.length === 1) {
			setSelectedDates((selectedDates) => [
				...selectedDates.filter(
					(selection) => selection.id !== rangeInfo.events[0].id
				),
			])
		}
		if (rangeInfo.events.length > 1) {
			if (rangeInfo.events[0].id === 9999) {
				setSelectedDates((selectedDates) => [
					...selectedDates.filter(
						(selection) => selection.id !== rangeInfo.events[1].id
					),
				])
			} else {
				setSelectedDates((selectedDates) => [
					...selectedDates.filter(
						(selection) => selection.id !== rangeInfo.events[0].id
					),
				])
			}
		}
	}

	const handleRangeClick = (rangeInfo) => {
		let id = rangeInfo.calendar._dataSource
			? rangeInfo.calendar._dataSource.length
			: 0
		let startDate = new Date(rangeInfo.startDate)
		let endDate = new Date(rangeInfo.endDate)

		let newDateRange = {
			id,
			startDate,
			endDate,
			isControlDate: false,
		}

		setSelectedDates((selectedDates) => [...selectedDates, newDateRange])
	}

	const handleSetControlDate = (dayInfo) => {
		let endDate = new Date(dayInfo)

		let controlTimeRange = {
			startTime: endDate.getTime() - 180 * 24 * 3600 * 1000,
			endTime: endDate.getTime(),
		}
		setControlTimeRange(controlTimeRange)

		let newControlInfo = {
			id: 9999,
			startDate: new Date(controlTimeRange.startTime),
			endDate: new Date(controlTimeRange.endTime),
			isControlDate: true,
		}
		console.log('newControlInfo:', newControlInfo)
		let controlDate = selectedDates.find((element) => element.id === 9999)
		if (controlDate) {
			setSelectedDates((selectedDates) =>
				selectedDates.map((dateInfo) =>
					dateInfo.id === 9999 ? newControlInfo : dateInfo
				)
			)
		} else {
			// setSelectedDates((selectedDates) => [newControlInfo, ...selectedDates])
			setSelectedDates((selectedDates) => [newControlInfo, ...selectedDates])
		}
	}

	const calcTotalStay = () => {
		if (!(selectedDates.length > 0)) {
			return '?'
		}
		let controlDate = selectedDates.find((element) => element.id === 9999)
		if (!controlDate) {
			return '?'
		}
		let controlTime = controlDate.endDate.getTime()
		let startOfRollbackTime = controlTime - 180 * 24 * 3600 * 1000

		let stayInControlRange = 0

		selectedDates.forEach((dateRange) => {
			if (dateRange.id != 9999) {
				let startTime = dateRange.startDate.getTime()
				let endTime = dateRange.endDate.getTime()
				let checkTime = startTime
				while (checkTime <= endTime) {
					if (checkTime >= startOfRollbackTime && checkTime <= controlTime) {
						stayInControlRange++
					}
					checkTime += 24 * 3600 * 1000
				}
			}
		})

		return stayInControlRange
	}

	const handleDayStyle = (element, date, events) => {
		console.log('element: ', element)
		console.log('date: ', date)
		console.log('events: ', events)
		let elementStyle = element.style
		elementStyle.borderRadius = 0

		if (events.length > 2) {
			console.log('overlapping dates')
			elementStyle.background = 'red'
			return
		}

		if (events.length > 1) {
			if (events[0].isControlDate) {
				elementStyle.background = 'blue'
				elementStyle.borderBottom = `5px solid grey`
			} else {
				console.log('overlapping dates')
				elementStyle.background = 'red'
				return
			}
		}
		if (events[0].isControlDate) {
			if (events[0].endDate.getTime() === date.getTime() + 60 * 60 * 1000) {
				elementStyle.background = 'grey' //'#1A8FE3'
				elementStyle.borderBottom = `5px solid grey` //'#1A8FE3
			} else {
				elementStyle.borderBottom = `5px solid grey` //'#1A8FE3
			}
		} else {
			elementStyle.background = 'blue'
		}
	}
	console.log('selectedDates: ', selectedDates)
	return (
		<div id="dashboard">
			<h1>Schengen Visa Calculator</h1>
			<h2>Total Days Stayed {calcTotalStay()}</h2>
			<div>
				<h3>Control day</h3>
				<span>
					<input
						id="min-date"
						type="date"
						onChange={(e) => handleSetControlDate(e.target.value)}
					/>
				</span>
			</div>

			<div id="calendar">
				<Calendar
					style={'custom'}
					customDataSourceRenderer={handleDayStyle}
					roundRangeLimits={false}
					// allowOverlap={false}
					enableRangeSelection={true}
					dataSource={selectedDates}
					onDayContextMenu={(evt) => handleRightClickDay(evt)}
					onRangeSelected={(e) => handleRangeClick(e)}
				/>
			</div>

			{selectedDates.length > 0 &&
				selectedDates.map((dateInfo, index) => (
					<div className="selectionInfoComponent" key={index}>
						<p>{dateInfo.startDate.toLocaleDateString()}</p>
						<p>{dateInfo.endDate.toLocaleDateString()}</p>
					</div>
				))}
		</div>
	)
}

export default Dashboard
