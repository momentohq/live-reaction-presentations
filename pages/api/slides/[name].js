
import slides from '../../../lib/slides';
export default async function handler(req, res) {
  try {
    const { name } = req.query;

    const presentation = slides.find(m => m.name == name.toLowerCase());
    if (!presentation) {
      return res.status(404).json({ message: `A presentation with the name "${name}" could not be found.` });
    }

    return res.status(200).json({ id: presentation.id, title: presentation.title });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong' });
  }
};