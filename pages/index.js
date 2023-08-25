import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Flex, Card, Heading, Image, Text, View, Link } from '@aws-amplify/ui-react';
import Head from 'next/head';
import { getUserDetail } from '../utils/Device';
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
					setPresentations([{ title: 'No presentations found', id: 'none' }])
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
				<title>Momento Presentations</title>
			</Head>
			<Flex direction="column" width="100%" alignItems="center" height="90vh">
				<Card variation="elevated" borderRadius="large" padding="1.5em 3em" maxWidth="90%" marginTop="1em">
					<Flex direction="column" gap="1em">
						<Heading level={4}>Hey there! <MdWavingHand /></Heading>
						<Text>Want to give or look at some presentations? Well you're in the right place!</Text>
						<Text>Pick one below to get started.</Text>
						<ul>
							{presentations.map(p => (
								<li><Link href={`/${p.name}`}>{p.title}</Link></li>
							))}
						</ul>
					</Flex>
				</Card>
			</Flex>
		</>
	);
};

export default ProfilePage;

