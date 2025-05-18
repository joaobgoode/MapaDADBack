const Espaco = require('../models/espaco.model.js');
const Horario = require('../models/horario.model.js');

module.exports = (wss) => {
  const notifyClients = (data) => {
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  };

  const toggleEspaco = async (req, res) => {
    try {
      const { name } = req.body;
      const espaco = await Espaco.findOne({ name: name });

      if (!espaco) {
        return res.status(404).json({ error: 'Espaço não encontrado' });
      }

      espaco.active = !espaco.active;
      await espaco.save();

      notifyClients({
        type: 'espacoUpdate',
        data: espaco,
      });

      return res.status(200).json(espaco);

    } catch (error) {
      console.error('Erro ao alternar o espaço:', error);
      return res.status(500).json({ error: 'Erro ao alternar o espaço' });
    }
  };
  const getEspacos = async (req, res) => {
    try {
      const espacos = await Espaco.find({});
      return res.status(200).json(espacos);
    } catch (error) {
      console.error('Erro ao buscar espaços:', error);
      return res.status(500).json({ error: 'Erro ao buscar espaços' });
    }
  };

  const getEspacosAtivos = async (req, res) => {
    try {
      const espacos = await Espaco.find({ active: true });
      return res.status(200).json(espacos);
    } catch (error) {
      console.error('Erro ao buscar espaços ativos:', error);
      return res.status(500).json({ error: 'Erro ao buscar espaços ativos' });
    }
  };

  const deleteEspaco = async (req, res) => {
    try {
      const { name } = req.params;
      const espaco = await Espaco.findOneAndDelete({ name: name })
      if (espaco) {
        notifyClients({
          type: 'espacoDelete',
          data: espaco,
        });
        return res.status(200).json(espaco);
      }
      return res.status(400).json({ error: 'Espaço não encontrado' });
    } catch (error) {
      console.error('Erro ao deletar o espaço:', error);
      return res.status(500).json({ error: 'Erro ao deletar o espaço' });
    }
  };

  const createEspaco = async (req, res) => {
    try {
      const { name } = req.body;
      const espaco = await Espaco.findOne({ name: name });
      if (espaco) {
        return res.status(400).json({ error: 'Espaço já existe' });
      }
      const newEspaco = new Espaco({ name: name });
      newEspaco.save()

      notifyClients({
        type: 'espacoCreate',
        data: newEspaco,
      });
      return res.status(201).json(newEspaco);
    } catch (error) {
      console.error('Erro ao criar o espaço:', error);
      return res.status(500).json({ error: 'Erro ao criar o espaço' });
    }
  };

  const changeEspaco = async (req, res) => {
    try {
      const { oldname, newname } = req.body;

      const oldEspaco = await Espaco.findOne({ name: oldname });
      if (!oldEspaco) {
        return res.status(404).json({ error: 'Espaço não encontrado' });
      }

      const newEspaco = await Espaco.findOne({ name: newname });
      if (newEspaco) {
        return res.status(400).json({ error: 'Espaço já existe' });
      }

      oldEspaco.name = newname;
      await oldEspaco.save();

      notifyClients({
        type: 'espacoUpdate',
        data: { old: oldname, new: newname }
      });

      await Horario.updateMany(
        { space: oldname },
        { $set: { space: newname } }
      );

      return res.status(200).json(oldEspaco);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao alterar o espaço' });
    }
  };
  return {
    toggleEspaco,
    getEspacos,
    getEspacosAtivos,
    deleteEspaco,
    createEspaco,
    changeEspaco
  };
}

