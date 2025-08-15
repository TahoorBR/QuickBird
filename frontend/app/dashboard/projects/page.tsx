"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../supabase_client";
import DashboardLayout from "../../../components/DashboardLayout";
import { Grid, Typography, Paper, CircularProgress } from "@mui/material";

interface Project {
  id: number;
  title: string;
  description: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*");
    if (error) console.error(error);
    else setProjects(data);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom color="secondary">
        Projects
      </Typography>
      {loading ? (
        <CircularProgress color="secondary" />
      ) : (
        <Grid container spacing={2} component="div">
        {projects.map((project) => (
            <Grid
            key={project.id}
            component="div"
            sx={{
                flexBasis: { xs: "100%", md: "50%", lg: "33.33%" },
                maxWidth: { xs: "100%", md: "50%", lg: "33.33%" },
                padding: 1,
            }}
            >
            <Paper
                sx={{
                p: 2,
                background: "rgba(0,0,0,0.6)",
                backdropFilter: "blur(10px)",
                }}
            >
                <Typography variant="h6" color="primary">
                {project.title}
                </Typography>
                <Typography variant="body2" color="white">
                {project.description}
                </Typography>
            </Paper>
            </Grid>
        ))}
        </Grid>
      )}
    </DashboardLayout>
  );
};

export default ProjectsPage;
