import StudentProposal from '../models/postgres/StudentProposalModel.js';
import { Op } from 'sequelize';

class PostgreSQLService {
    // Generate unique proposal number
    generateProposalNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const timestamp = Date.now().toString().slice(-6);
        return `PROP-${year}${month}-${timestamp}`;
    }

    // Student Proposal CRUD operations
    async createProposal(proposalData) {
        try {
            const proposal = await StudentProposal.create({
                ...proposalData,
                proposal_number: this.generateProposalNumber()
            });
            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllProposals(filters = {}) {
        try {
            const whereClause = {};
            
            if (filters.status) {
                whereClause.status = filters.status;
            }
            
            if (filters.user_id) {
                whereClause.user_id = filters.user_id;
            }
            
            if (filters.search) {
                whereClause[Op.or] = [
                    { title: { [Op.iLike]: `%${filters.search}%` } },
                    { background: { [Op.iLike]: `%${filters.search}%` } },
                    { proposal_number: { [Op.iLike]: `%${filters.search}%` } }
                ];
            }

            const proposals = await StudentProposal.findAll({
                where: whereClause,
                order: [['createdAt', 'DESC']],
                limit: filters.limit || 50,
                offset: filters.offset || 0
            });

            return { success: true, data: proposals };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProposalById(id) {
        try {
            const proposal = await StudentProposal.findByPk(id);
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }
            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProposalByNumber(proposalNumber) {
        try {
            const proposal = await StudentProposal.findOne({
                where: { proposal_number: proposalNumber }
            });
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }
            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateProposal(id, updateData) {
        try {
            const proposal = await StudentProposal.findByPk(id);
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }

            await proposal.update(updateData);
            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async deleteProposal(id) {
        try {
            const proposal = await StudentProposal.findByPk(id);
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }

            await proposal.destroy();
            return { success: true, message: 'Proposal deleted successfully' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async submitProposal(id) {
        try {
            const proposal = await StudentProposal.findByPk(id);
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }

            if (proposal.status !== 'draft') {
                return { success: false, error: 'Only draft proposals can be submitted' };
            }

            await proposal.update({
                status: 'submitted',
                submitted_at: new Date()
            });

            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async reviewProposal(id, reviewData) {
        try {
            const proposal = await StudentProposal.findByPk(id);
            if (!proposal) {
                return { success: false, error: 'Proposal not found' };
            }

            await proposal.update({
                status: reviewData.status,
                reviewer_comments: reviewData.reviewer_comments,
                reviewed_by: reviewData.reviewed_by,
                reviewed_at: new Date()
            });

            return { success: true, data: proposal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getProposalStats() {
        try {
            const totalProposals = await StudentProposal.count();
            const draftProposals = await StudentProposal.count({ where: { status: 'draft' } });
            const submittedProposals = await StudentProposal.count({ where: { status: 'submitted' } });
            const underReviewProposals = await StudentProposal.count({ where: { status: 'under_review' } });
            const approvedProposals = await StudentProposal.count({ where: { status: 'approved' } });

            return {
                success: true,
                data: {
                    total: totalProposals,
                    draft: draftProposals,
                    submitted: submittedProposals,
                    under_review: underReviewProposals,
                    approved: approvedProposals
                }
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

export default new PostgreSQLService();
