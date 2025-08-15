"use client";

import DashboardLayout from "../../components/DashboardLayout";
import {
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import TaskIcon from "@mui/icons-material/Task";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import NotificationsIcon from "@mui/icons-material/Notifications";

const DashboardPage = () => {
  const sage = "#889977"; // dark olive/sage

  const cards = [
    {
      title: "Projects",
      desc: "Manage all your projects",
      icon: <FolderIcon sx={{ fontSize: 40, color: sage }} />,
    },
    {
      title: "Tasks",
      desc: "Track and update tasks",
      icon: <TaskIcon sx={{ fontSize: 40, color: sage }} />,
    },
    {
      title: "Tools",
      desc: "Access AI-powered tools",
      icon: <BuildIcon sx={{ fontSize: 40, color: sage }} />,
    },
    {
      title: "Users",
      desc: "Manage clients and team",
      icon: <PeopleIcon sx={{ fontSize: 40, color: sage }} />,
    },
  ];

  const recentActivities = [
    "New project 'Apollo' created",
    "Task 'Design UI' completed",
    "Tool 'AI Analyzer' updated",
    "User 'Jane Doe' added to team",
  ];

  return (
    <DashboardLayout>
      {/* Welcome section */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Typography variant="h4" sx={{ color: "#fff" }}>
          Welcome back, Alex!
        </Typography>
        <Typography variant="body1" sx={{ color: "#ccc", mt: 1 }}>
          Here's what's happening in your workspace today.
        </Typography>
      </Box>

      {/* Quick stats cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          mb: 4,
        }}
      >
        {cards.map((card) => (
          <Box
            key={card.title}
            sx={{
              flex: "1 1 calc(25% - 16px)",
              minWidth: 200,
              p: 4,
              borderRadius: 3,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${sage}`,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: `0 12px 40px rgba(136,153,119,0.7)`,
              },
            }}
          >
            {card.icon}
            <Typography variant="h6" sx={{ color: "#fff", mt: 2, mb: 1 }}>
              {card.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "#ddd", textAlign: "center" }}>
              {card.desc}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Recent activity and quick actions */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {/* Recent activity */}
        <Box
          sx={{
            flex: "1 1 50%",
            minWidth: 300,
            p: 3,
            borderRadius: 3,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${sage}`,
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
            Recent Activity
          </Typography>
          <List>
            {recentActivities.map((act, i) => (
              <Box key={i}>
                <ListItem sx={{ color: "#ccc" }}>
                  <NotificationsIcon sx={{ mr: 2, color: sage }} />
                  <ListItemText primary={act} />
                </ListItem>
                {i < recentActivities.length - 1 && <Divider sx={{ borderColor: "#444" }} />}
              </Box>
            ))}
          </List>
        </Box>

        {/* Quick actions */}
        <Box
          sx={{
            flex: "1 1 50%",
            minWidth: 300,
            p: 3,
            borderRadius: 3,
            background: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(12px)",
            border: `1px solid ${sage}`,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
            Quick Actions
          </Typography>
          <Button
            sx={{
              backgroundColor: sage,
              color: "#000",
              "&:hover": { backgroundColor: "#778866" },
            }}
          >
            Create Project
          </Button>
          <Button
            sx={{
              backgroundColor: sage,
              color: "#000",
              "&:hover": { backgroundColor: "#778866" },
            }}
          >
            Add Task
          </Button>
          <Button
            sx={{
              backgroundColor: sage,
              color: "#000",
              "&:hover": { backgroundColor: "#778866" },
            }}
          >
            Invite User
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;
