import { Sequelize } from "sequelize";
import postgresDb from "../../config/postgresDatabase.js";

const { DataTypes } = Sequelize;

const StudentProposal = postgresDb.define("student_proposal", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    proposal_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    background: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    objectives: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    target_audience: {
        type: DataTypes.STRING,
        allowNull: false
    },
    implementation_plan: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    timeline: {
        type: DataTypes.JSON,
        allowNull: true
    },
    budget_breakdown: {
        type: DataTypes.JSON,
        allowNull: true
    },
    expected_outcomes: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    risk_assessment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    evaluation_method: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_required'),
        defaultValue: 'draft'
    },
    reviewer_comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reviewed_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    submitted_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    freezeTableName: true,
    timestamps: true
});

export default StudentProposal;
