import PostgreSQLService from '../services/PostgreSQLService.js';

// Get all proposals
export const getAllProposals = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            limit: parseInt(req.query.limit) || 50,
            offset: parseInt(req.query.offset) || 0
        };

        // If not admin, only show user's own proposals
        if (req.userRole !== 'admin') {
            filters.user_id = req.userId;
        }

        const result = await PostgreSQLService.getAllProposals(filters);

        if (result.success) {
            res.status(200).json({
                status: 'success',
                data: result.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get proposal by ID
export const getProposalById = async (req, res) => {
    try {
        const result = await PostgreSQLService.getProposalById(req.params.id);

        if (result.success) {
            // Check if user can access this proposal
            if (req.userRole !== 'admin' && result.data.user_id !== req.userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to view this proposal'
                });
            }

            res.status(200).json({
                status: 'success',
                data: result.data
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get proposal by number
export const getProposalByNumber = async (req, res) => {
    try {
        const result = await PostgreSQLService.getProposalByNumber(req.params.proposalNumber);

        if (result.success) {
            // Check if user can access this proposal
            if (req.userRole !== 'admin' && result.data.user_id !== req.userId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Not authorized to view this proposal'
                });
            }

            res.status(200).json({
                status: 'success',
                data: result.data
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Create new proposal
export const createProposal = async (req, res) => {
    try {
        const proposalData = {
            ...req.body,
            user_id: req.userId
        };

        const result = await PostgreSQLService.createProposal(proposalData);

        if (result.success) {
            res.status(201).json({
                status: 'success',
                message: 'Proposal created successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update proposal
export const updateProposal = async (req, res) => {
    try {
        const proposalId = req.params.id;
        
        // Check if proposal exists and user has permission
        const checkResult = await PostgreSQLService.getProposalById(proposalId);
        if (!checkResult.success) {
            return res.status(404).json({
                status: 'error',
                message: checkResult.error
            });
        }

        if (req.userRole !== 'admin' && checkResult.data.user_id !== req.userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this proposal'
            });
        }

        // Check if proposal can be edited
        if (checkResult.data.status === 'submitted' || checkResult.data.status === 'under_review') {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot edit a proposal that is submitted or under review'
            });
        }

        const result = await PostgreSQLService.updateProposal(proposalId, req.body);

        if (result.success) {
            res.status(200).json({
                status: 'success',
                message: 'Proposal updated successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Delete proposal
export const deleteProposal = async (req, res) => {
    try {
        const proposalId = req.params.id;
        
        // Check if proposal exists and user has permission
        const checkResult = await PostgreSQLService.getProposalById(proposalId);
        if (!checkResult.success) {
            return res.status(404).json({
                status: 'error',
                message: checkResult.error
            });
        }

        if (req.userRole !== 'admin' && checkResult.data.user_id !== req.userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to delete this proposal'
            });
        }

        const result = await PostgreSQLService.deleteProposal(proposalId);

        if (result.success) {
            res.status(200).json({
                status: 'success',
                message: result.message
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Submit proposal
export const submitProposal = async (req, res) => {
    try {
        const proposalId = req.params.id;
        
        // Check if proposal exists and user has permission
        const checkResult = await PostgreSQLService.getProposalById(proposalId);
        if (!checkResult.success) {
            return res.status(404).json({
                status: 'error',
                message: checkResult.error
            });
        }

        if (req.userRole !== 'admin' && checkResult.data.user_id !== req.userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to submit this proposal'
            });
        }

        const result = await PostgreSQLService.submitProposal(proposalId);

        if (result.success) {
            res.status(200).json({
                status: 'success',
                message: 'Proposal submitted successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Review proposal (admin only)
export const reviewProposal = async (req, res) => {
    try {
        const proposalId = req.params.id;
        const reviewData = {
            status: req.body.status,
            reviewer_comments: req.body.reviewer_comments,
            reviewed_by: req.userId
        };

        const result = await PostgreSQLService.reviewProposal(proposalId, reviewData);

        if (result.success) {
            res.status(200).json({
                status: 'success',
                message: 'Proposal reviewed successfully',
                data: result.data
            });
        } else {
            res.status(400).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get proposal statistics
export const getProposalStats = async (req, res) => {
    try {
        const result = await PostgreSQLService.getProposalStats();

        if (result.success) {
            res.status(200).json({
                status: 'success',
                data: result.data
            });
        } else {
            res.status(500).json({
                status: 'error',
                message: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
