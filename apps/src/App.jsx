import InvoiceTable from './InvoiceTable'
import { useState, useEffect } from 'react'
import { CreateSlideButton } from './CreateSlideButton'

const Home = () => {
	const [filenames, setFilenames] = useState([])
	const [selectedFile, setSelectedFile] = useState('')
	const [tableData, setTableData] = useState([])

	useEffect(() => {
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
		<div className="p-4">
			<h1 className='text-3xl py-5'>AI-Powered Slide Creator</h1>
			<div className="flex items-center space-x-4 mb-4">
				<select
					onChange={(e) => setSelectedFile(e.target.value)}
					value={selectedFile}
					className="bg-gray-900 text-white font-semibold py-2 px-4 rounded border border-gray-700"
				>
					<option value="" disabled>Select a file</option>
					{filenames.map((filename, index) => (
						<option key={index} value={filename}>{filename}</option>
					))}
				</select>
				<CreateSlideButton disabled={!selectedFile} />
			</div>
			{tableData.length > 0 && <InvoiceTable data={tableData} />}
		</div>
	)
}

export default Home
