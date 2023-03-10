/* eslint-disable @typescript-eslint/no-misused-promises */
import useUserSession from "@/hooks/useUserSession";
import { api } from "@/utils/api";
import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import { HandThumbUpIcon as HandThumbUpIconSolid } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import { motion } from "framer-motion";
import TechTagRow from "../../TechTagRow/TechTagRow";
import { ProjectModel } from "../Project.model";

interface ProjectCardProps {
  project: ProjectModel;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const utils = api.useContext();
  const user = useUserSession();

  const { mutateAsync } = api.likes.create.useMutation({
    onSuccess: async () => {
      await utils.events.findUnique.invalidate({
        id: project.eventId,
      });
      await utils.likes.findUnique.invalidate({
        projectId: project.id,
      });
    },
  });

  const { data: likeExists } = api.likes.findUnique.useQuery(
    {
      projectId: project?.id,
      userId: user?.id || "",
    },
    {
      enabled: !!user?.id,
    }
  );

  const handleUpvote = async () => {
    await mutateAsync({
      projectId: project.id,
      userId: user?.id || "",
    });
  };

  return (
    <div
      key={project.name}
      className="flex w-full flex-col overflow-hidden rounded-lg shadow-lg"
    >
      <div className="flex flex-1 flex-col justify-between bg-white p-6">
        <div className="flex-1">
          <div className="mt-2 block">
            <p className="text-xl font-semibold text-gray-700">
              {project.name}
            </p>
            <p className="py-2">
              <TechTagRow techs={project.techs} />
            </p>
            <p className="mt-3 text-base text-gray-500">
              {project.description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-row items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {/* {hideEmailBetter(project.author?.email) ?? "No Name"} */}
              {project.author.name}
            </p>
            <div className="flex space-x-1 text-sm text-gray-500">
              <div>{format(new Date(project.createdAt), "MMMM dd, yyyy")}</div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <motion.div
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{ scale: 0.97 }}
            >
              {user ? (
                likeExists ? (
                  <HandThumbUpIconSolid
                    onClick={handleUpvote}
                    className="block h-6 w-6 cursor-pointer text-gray-700"
                  />
                ) : (
                  <HandThumbUpIcon
                    onClick={handleUpvote}
                    className="block h-6 w-6 cursor-pointer text-gray-700"
                  />
                )
              ) : null}
            </motion.div>
            <div>{project._count?.likes ?? 0} Likes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
