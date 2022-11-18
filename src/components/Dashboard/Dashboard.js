import React, { useEffect, useState } from 'react'
import Calendar from 'rc-year-calendar'
import './Dashboard.css'

const Dashboard = () => {
	const [selectedDates, setSelectedDates] = useState([])
	const [entryDate, setEntryDate] = useState()

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
		console.log('rangeInfo.events: ', rangeInfo.events.length > 0)

		if (rangeInfo.events.length > 0)
			setSelectedDates((selectedDates) => [
				...selectedDates.filter(
					(selection) => selection.id !== rangeInfo.events[0].id
				),
			])
	}

	const handleRangeClick = (rangeInfo) => {
		let id = rangeInfo.calendar._dataSource
			? rangeInfo.calendar._dataSource.length
			: 0
		let startDate = new Date(rangeInfo.startDate)
		let endDate = new Date(rangeInfo.endDate)
		let stayCount = Math.ceil(
			(rangeInfo.endDate.getTime() - rangeInfo.startDate.getTime()) /
				(1000 * 3600 * 24) +
				1
		)

		let newDateRange = {
			id,
			startDate,
			endDate,
			stayCount,
		}

		setSelectedDates((selectedDates) => [...selectedDates, newDateRange])
	}
	/////////
	const calcTotalStay = () => {
		let totalStay = 0
		selectedDates.forEach((range) => {
			totalStay += range.stayCount
		})
		return totalStay
	}

	return (
		<div id="dashboard">
			<h1>Schengen Visa Calculator</h1>
			<h2>Total Days Stayed {calcTotalStay()}</h2>
			<h3>Entry </h3>
			<span>
				<input id="min-date" type="date" />
			</span>

			<Calendar
				style={'background'}
				roundRangeLimits={false}
				allowOverlap={false}
				enableRangeSelection={true}
				dataSource={selectedDates}
				onDayContextMenu={(evt) => handleRightClickDay(evt)}
				onRangeSelected={(e) => handleRangeClick(e)}
			/>
		</div>
	)
}

export default Dashboard
