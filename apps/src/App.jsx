import { useState, useEffect } from 'react'
import InvoiceTable from './InvoiceTable'
import { CreateSlideButton } from './CreateSlideButton'

const Home = () => {
	const [filenames, setFilenames] = useState([])
	const [selectedFile, setSelectedFile] = useState('')
	const [tableData, setTableData] = useState([])

	useEffect(() => {
		// Fetch the list of filenames
		fetch(`${import.meta.env.VITE_APP_URL}/data/files`)
			.then(response => response.json())
			.then(data => {
				if (Array.isArray(data)) {
					setFilenames(data)
				} else {
					console.error('Fetched data is not an array:', data)
				}
			})
			.catch(error => console.error('Error fetching filenames:', error))
	}, [])

	useEffect(() => {
		// Fetch the data for the selected file
		if (selectedFile) {
			const baseURL = `${import.meta.env.VITE_APP_URL}/data/files/${selectedFile}`
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
		}
	}, [selectedFile])

	return (
		<div>
			<select onChange={(e) => setSelectedFile(e.target.value)} value={selectedFile}>
				<option value="" disabled>Select a file</option>
				{filenames.map((filename, index) => (
					<option key={index} value={filename}>{filename}</option>
				))}
			</select>
			<CreateSlideButton />
			{tableData.length > 0 && <InvoiceTable data={tableData} />}
		</div>
	)
}

export default Home