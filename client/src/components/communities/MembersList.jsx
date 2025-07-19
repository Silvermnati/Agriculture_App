import React, { useState } from "react";
import { Crown, Shield, User, Search } from "lucide-react";

const MembersList = ({ members, currentUserRole = "member" }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full";
    switch (role) {
      case "admin":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "moderator":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">
          Community Members ({members.length})
        </h3>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderators</option>
          <option value="member">Members</option>
        </select>
      </div>

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{member.name}</h4>
                  {getRoleIcon(member.role)}
                </div>
                <p className="text-sm text-gray-500">
                  Joined {member.joinedDate} • {member.postsCount} posts
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className={getRoleBadge(member.role)}>{member.role}</span>

              {currentUserRole === "admin" && member.role !== "admin" && (
                <button className="text-gray-400 hover:text-gray-600">
                  •••
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No members found matching your criteria
        </div>
      )}
    </div>
  );
};

export default MembersList;
