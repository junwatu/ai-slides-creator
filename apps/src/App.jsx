import { useState, useEffect } from 'react'
import InvoiceTable from './InvoiceTable'

const Home = () => {
	const [tableData, setTableData] = useState([])
	const baseURL = `${import.meta.env.VITE_APP_URL}/data/files/spare-part-sales-2022.json`

	useEffect(() => {
		// Replace this URL with your actual endpoint
		fetch(baseURL)
			.then(response => response.json())
			.then(data => {
				if (Array.isArray(data)) {
					setTableData(data)
				} else {
					console.error('Fetched data is not an array:', data)
				}
			})
			.catch(error => console.error('Error fetching data:', error))
	}, [baseURL])

	return (
		<div>
			<InvoiceTable data={tableData} />
		</div>
	)
}

export default Home