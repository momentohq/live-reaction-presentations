
import slides from '../../../lib/slides';

export default async function handler(req, res) {
  try {
    const presentations = slides.map(m => {
      return {
        name: m.name,
        title: m.title
      };
    });

    return res.status(200).json(presentations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Oh no. Something went wrong. That's our bad." });
  }
};