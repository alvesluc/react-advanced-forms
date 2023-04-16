import { useState } from "react";
import "./styles/global.css";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const fileSize = 10;

const createUserFormSchema = z
  .object({
    avatar: z
      .instanceof(FileList)
      .transform((list) => list.item(0)!)
      .refine(
        (file) => file.size <= fileSize * 1024 * 1024,
        `The file must be a maximum of ${fileSize}Mb`
      ),
    name: z
      .string()
      .nonempty("Name is required")
      .transform((name) => capitalize(name)),
    email: z
      .string()
      .nonempty("E-mail is required")
      .email("Please insert a valid e-mail")
      .toLowerCase()
      .refine((email) => {
        return email.endsWith("@gmail.com");
      }, "Must be a gmail account"),
    password: z
      .string()
      .min(8, "The password need to be at least 8 characters long"),
    confirmPassword: z
      .string()
      .min(8, "The password need to be at least 8 characters long"),
    techs: z
      .array(
        z.object({
          title: z.string().nonempty("Title is required"),
          knowledge: z.coerce.number().min(1).max(100),
        })
      )
      .min(2, "Add at least 2 techs"),
  })
  .refine((userForm) => userForm.password === userForm.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function capitalize(word: string): string {
  return word
    .trim()
    .split(" ")
    .map((part) => {
      return part[0].toLocaleUpperCase().concat(part.substring(1));
    })
    .join(" ");
}

type CreateUserFormData = z.infer<typeof createUserFormSchema>;

export function App() {
  const [output, setOutput] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "techs",
  });

  function addNewTech() {
    append({ title: "", knowledge: 1 });
  }

  function createUser(data: CreateUserFormData) {
    // Handle upload here
    console.log(data.avatar);
    setOutput(JSON.stringify(data, null, 2));
  }

  return (
    <main className="flex h-full min-h-screen items-center justify-center bg-zinc-50">
      <form
        onSubmit={handleSubmit(createUser)}
        className="flex w-full max-w-xs flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="avatar">Avatar</label>
          <input type="file" accept="image/*" {...register("avatar")} />
          {errors.avatar && (
            <span className="text-sm text-red-500">
              {errors.avatar.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            className="h-10 rounded border border-zinc-200 px-3 shadow-sm"
            {...register("name")}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            className="h-10 rounded border border-zinc-200 px-3 shadow-sm"
            {...register("email")}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            className="h-10 rounded border border-zinc-200 px-3 shadow-sm"
            {...register("password")}
          />
          {errors.password && (
            <span className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="confirmPassword">Confirm password</label>
          <input
            type="password"
            className="h-10 rounded border border-zinc-200 px-3 shadow-sm"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="" className="flex items-center justify-between">
            Techs
            <button
              type="button"
              onClick={addNewTech}
              className="text-sm text-emerald-500"
            >
              Adicionar
            </button>
          </label>
          {fields.map((field, i) => {
            return (
              <div key={field.id} className="flex gap-2">
                <div className="flex flex-1 flex-col gap-1">
                  <input
                    type="text"
                    className="h-10  rounded border border-zinc-200 px-3 shadow-sm"
                    {...register(`techs.${i}.title`)}
                  />
                  {errors.techs?.[i]?.title && (
                    <span className="text-sm text-red-500">
                      {errors.techs?.[i]?.title?.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    className="h-10 w-20 rounded border border-zinc-200 px-3 shadow-sm"
                    {...register(`techs.${i}.knowledge`)}
                  />
                  {errors.techs?.[i]?.knowledge && (
                    <span className="text-sm text-red-500">
                      {errors.techs?.[i]?.knowledge?.message}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {errors.techs && (
            <span className="text-sm text-red-500">{errors.techs.message}</span>
          )}
        </div>

        <button
          type="submit"
          className="h-10 rounded bg-emerald-500 font-semibold text-white transition duration-300 hover:bg-emerald-600"
        >
          Salvar
        </button>
        <pre>{output}</pre>
      </form>
    </main>
  );
}
