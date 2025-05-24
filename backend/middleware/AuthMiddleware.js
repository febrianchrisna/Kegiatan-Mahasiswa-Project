import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if (error) return res.sendStatus(403);
    req.userId = decoded.id;
    req.email = decoded.email;
    req.userRole = decoded.role; // Tambahkan ini agar role tersedia di semua request
    next();
  });
};

export const isAdmin = async (req, res, next) => {
  try {
    // Cari user dari database jika belum ada role di req
    let userRole = req.userRole;
    if (!userRole) {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userRole = user.role;
      req.userRole = user.role;
    }

    if (userRole !== 'admin') {
      return res.status(403).json({ message: "Requires admin privileges" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check if user is user/student (not admin)
export const isUser = async (req, res, next) => {
  try {
    let userRole = req.userRole;
    if (!userRole) {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      userRole = user.role;
      req.userRole = user.role;
    }

    if (userRole !== 'user') {
      return res.status(403).json({ message: "Requires user privileges" });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check if user is either admin or the owner of the resource
export const isAdminOrOwner = (resourceUserIdField = 'user_id') => {
  return async (req, res, next) => {
    try {
      let userRole = req.userRole;
      if (!userRole) {
        const user = await User.findByPk(req.userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        userRole = user.role;
        req.userRole = user.role;
      }

      // Admin can access everything
      if (userRole === 'admin') {
        return next();
      }

      // For non-admin users, check if they own the resource
      // This will be used in controllers to verify ownership
      req.isOwnershipRequired = true;
      next();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  };
};
