const express = require('express');
const rout = express.Router();


const qualityControler = require('../controllers/quality.controller');




rout.post('/create', qualityControler.createProject);
rout.get('/getall', qualityControler.getAllProjects);
rout.put('/updateproject', qualityControler.updateProject);
rout.put('/updaterating', qualityControler.updateProjectRating);
rout.delete('/delete/:id', qualityControler.deleteProject);
rout.get('/:id', qualityControler.getProjectById);


module.exports = rout;