const mongoose = require('mongoose');
const QualityModel = require('../models/quality.model');


module.exports.createProject = (req, resp, next) => {

    let qualityArray = req.body;
    QualityModel.collection.insertMany(qualityArray).then(async project => {
        if (project) {
            await resp.status(200).json({
                status: 200,
                message: 'Project created successfully',
                insetCount: project.insertedCount,
                data: project.ops
            });
        } else {
            console.log("unsaved", project);
        }
    }).catch(err => {
        console.log("err", err);
        resp.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err
        });
    });

};

module.exports.getAllProjects = (req, resp, next) => {

    QualityModel.find().then(projects => {
        if (projects.length >= 1) {
            resp.status(200).json({
                status: 200,
                message: 'data found successfully',
                data: projects
            });
        } else {
            resp.status(200).json({
                status: 200,
                message: 'No record found',
                data: projects
            });
        }
    }).catch(err => {
        resp.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err
        });
    });
};

module.exports.updateProject = (req, resp, next) => {
    let id = req.body._id;
    let addingRate = req.body.addRating;
    QualityModel.updateOne({ _id: id }, { $push: { addRating: addingRate } })
        .then(project => {
            if (project) {
                resp.status(200).json({
                    status: 200,
                    message: 'data updated successfully'
                });
            }
        }).catch(err => {
            console.log(err);
            resp.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: err
            });
        });
};

module.exports.deleteProject = (req, resp, next) => {
    let id = req.params.id;
    QualityModel.deleteOne({ _id: id }).then(project => {
        if (project) {
            resp.status(200).json({
                status: 200,
                message: 'deleted successfully'
            });
        }
    }).catch(err => {
        console.log(err);
        resp.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err
        });
    });
};

module.exports.updateProjectRating = (req, resp, next) => {
    let weightage = req.body.weightage;
    let rating = req.body.rating;
    let id = req.body._id;

    QualityModel.updateOne({ _id: id }, { $set: { weightage: weightage, rating: rating } })
        .then(project => {
            resp.status(200).json({
                status: 200,
                message: 'updated successfully'
            });
        })
        .catch(err => {
            console.log(err);
            resp.status(500).json({
                status: 500,
                message: 'Internal server error',
                error: err
            });
        });
};
module.exports.getProjectById = (req, resp, next) => {
    const _id = req.params.id;
    QualityModel.findById(_id).then(project => {
        resp.status(200).json({
            status: 200,
            message: 'data found successfully',
            data: project
        });
    }).catch(err => {
        resp.status(500).json({
            status: 500,
            message: 'Internal server error',
            error: err
        });
    });
};