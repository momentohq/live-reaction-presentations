import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Flex, Card, Heading, Text, Link } from '@aws-amplify/ui-react';
import Head from 'next/head';
import Header from "../components/Header";
import { MdWavingHand } from 'react-icons/md';

const ProfilePage = () => {
	const router = useRouter();
	const [presentations, setPresentations] = useState([]);

	useEffect(() => {
		async function loadPresentations() {
			try {
				const response = await fetch('/api/slides');
				const data = await response.json();
				if (response.status > 399) {
					console.error(data.message);
					setPresentations([{ title: 'No presentations found', id: 'none' }]);
				} else {
					setPresentations(data);

				}
			} catch (err) {
				console.error(err);
			}
		}

		loadPresentations();
	}, []);

	return (
		<>
			<Head>
				<title>View Presentations</title>
			</Head>
			<Flex direction="column" width="100%">
				<Header />
				<Flex direction="column" width="100%" alignItems="center" height="90vh">
					<Card variation="elevated" borderRadius="large" padding="1.5em 3em" maxWidth="90%" marginTop="1em">
						<Flex direction="column" gap="1em">
							<Heading level={4}>Hey there! <MdWavingHand /></Heading>
							<Text>Want to give or look at some presentations? Well you're in the right place!</Text>
							<Text>Pick one below to get started.</Text>
							<ul style={{ marginTop: '0em' }}>
								{presentations.map(p => (
									<li><Link href={`/${p.name}`}>{p.title}</Link></li>
								))}
							</ul>
						</Flex>
					</Card>
				</Flex>
			</Flex>
		</>
	);
};

export default ProfilePage;

