import express from 'express';
import { login, register, logout, getUser } from '../controller/UserController.js';
import { 
    login as authLogin, 
    registerStudent, 
    registerAdmin, 
    getProfile, 
    updateProfile, 
    changePassword,
    logout as authLogout 
} from '../controller/AuthController.js';
import {
    getAllActivities, getActivityById, createActivity,
    updateActivity, deleteActivity, approveActivity, getActivityStats
} from '../controller/StudentActivityController.js';
import {
    getAllProposals, getProposalById, getProposalByNumber, createProposal,
    updateProposal, deleteProposal, submitProposal, reviewProposal, getProposalStats
} from '../controller/StudentProposalController.js';
import { verifyToken, isAdmin, isUser, isAdminOrOwner } from '../middleware/AuthMiddleware.js';
import { refreshToken } from '../controller/RefreshToken.js';

const router = express.Router();

// ==================== AUTHENTICATION ROUTES ====================
// Legacy auth routes (keep for backward compatibility)
router.post("/login", login);
router.post("/register", register);
router.get("/logout", verifyToken, logout);
router.get("/token", refreshToken);

// Enhanced auth routes
router.post("/auth/login", authLogin);
router.post("/auth/register/student", registerStudent);
router.post("/auth/register/admin", registerAdmin);
router.post("/auth/logout", verifyToken, authLogout);
router.get("/auth/profile", verifyToken, getProfile);
router.put("/auth/profile", verifyToken, updateProfile);
router.put("/auth/change-password", verifyToken, changePassword);
router.post("/auth/refresh", refreshToken);

// ==================== ADMIN ROUTES (khusus admin) ====================
// User management (admin only)
router.get("/admin/users", verifyToken, isAdmin, getUser);

// Student Activity management (admin actions)
router.get("/admin/activities", verifyToken, isAdmin, getAllActivities);
router.put("/admin/activities/:id/approve", verifyToken, isAdmin, approveActivity);
router.get("/admin/activities/stats", verifyToken, isAdmin, getActivityStats);

// Student Proposal management (admin actions)
router.get("/admin/proposals", verifyToken, isAdmin, getAllProposals);
router.put("/admin/proposals/:id/review", verifyToken, isAdmin, reviewProposal);
router.get("/admin/proposals/stats", verifyToken, isAdmin, getProposalStats);

// ==================== STUDENT ACTIVITY ROUTES (MySQL) ====================
// Student Activity management - accessible by both admin and users
router.get("/activities", verifyToken, getAllActivities);
router.get("/activities/:id", verifyToken, getActivityById);
router.post("/activities", verifyToken, createActivity);
router.put("/activities/:id", verifyToken, updateActivity);
router.delete("/activities/:id", verifyToken, deleteActivity);

// ==================== STUDENT PROPOSAL ROUTES (PostgreSQL) ====================
// Student Proposal management - accessible by both admin and users
router.get("/proposals", verifyToken, getAllProposals);
router.get("/proposals/number/:proposalNumber", verifyToken, getProposalByNumber);
router.get("/proposals/:id", verifyToken, getProposalById);
router.post("/proposals", verifyToken, createProposal);
router.put("/proposals/:id", verifyToken, updateProposal);
router.delete("/proposals/:id", verifyToken, deleteProposal);
router.put("/proposals/:id/submit", verifyToken, submitProposal);

// ==================== HEALTH CHECK ====================
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Student Activity Management System is running',
    version: '1.0.0',
    databases: {
      mysql: 'Users, Authentication & Student Activities',
      postgresql: 'Student Proposals'
    },
    features: {
      authentication: 'JWT with role-based access',
      roles: ['admin', 'user'],
      databases: 'Dual-database architecture',
      modules: [
        'Student Activity Management',
        'Student Proposal System',
        'User Authentication & Authorization'
      ]
    }
  });
});

export default router;
