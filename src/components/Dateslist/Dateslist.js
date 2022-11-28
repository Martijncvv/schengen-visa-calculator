import React, { useEffect, useState } from 'react'
import Daterange from '../Daterange'
import './Dateslist.css'

const Datelist = ({ dates }) => {
	return (
		<div id="dateslist-field">
			{dates.length > 0 &&
				dates.map(
					(dateInfo, index) =>
						dateInfo.id !== 9999 && (
							<Daterange
								index={index}
								startDate={dateInfo.startDate.toLocaleDateString()}
								endDate={dateInfo.endDate.toLocaleDateString()}
							/>
						)
				)}
		</div>
	)
}

export default Datelist
