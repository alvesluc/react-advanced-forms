import { useState } from "react";
import "./styles/global.css";
import { Form } from "./components/Form";
import { PlusCircle, XCircle } from "lucide-react";

import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const fileSizeInMb = 10;
const fileSize = fileSizeInMb * 1024 * 1024;

const createUserFormSchema = z
  .object({
    avatar: z
      .instanceof(FileList)
      .transform((list) => list.item(0))
      .superRefine((file, ctx) => {
        if (!file) {
          return ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `The avatar image is required.`,
          });
        }

        if (file.size > fileSize) {
          return ctx.addIssue({
            code: z.ZodIssueCode.too_big,
            maximum: fileSize,
            type: "array",
            inclusive: true,
            message: `The file must be a maximum of ${fileSizeInMb}Mb`,
          });
        }
      }),
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
  const createUserForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserFormSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
    control,
    watch,
  } = createUserForm;

  const userPassword = watch("password");

  const isPasswordStrong = new RegExp(
    "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})"
  ).test(userPassword);

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
    <main className="flex h-full my-5 min-h-screen items-center justify-center bg-zinc-50">
      <FormProvider {...createUserForm}>
        <form
          onSubmit={handleSubmit(createUser)}
          className="flex w-full max-w-xs flex-col gap-4"
        >
          <Form.Field>
            <Form.Label htmlFor="avatar">
              Avatar
              <span className="text-xs">{`Max size ${fileSizeInMb}Mb`}</span>
            </Form.Label>
            <Form.Input
              name="avatar"
              type="file"
              accept="image/*"
              className=""
            />
            <Form.ErrorMessage field="avatar" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="name">Name</Form.Label>
            <Form.Input type="text" name="name" />
            <Form.ErrorMessage field="name" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="email">E-mail</Form.Label>
            <Form.Input type="email" name="email" />
            <Form.ErrorMessage field="email" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="password">
              Password
              {isPasswordStrong ? (
                <span className="text-xs text-emerald-600">
                  strong password
                </span>
              ) : (
                <span className="text-xs text-red-500">weak password</span>
              )}
            </Form.Label>
            <Form.Input type="password" name="password" />
            <Form.ErrorMessage field="password" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="confirmPassword">Confirm password</Form.Label>
            <Form.Input type="password" name="confirmPassword" />
            <Form.ErrorMessage field="confirmPassword" />
          </Form.Field>

          <Form.Field>
            <Form.Label htmlFor="">
              Techs
              <button
                type="button"
                onClick={addNewTech}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-500"
              >
                Add new
                <PlusCircle size={16} />
              </button>
            </Form.Label>
            {fields.map((field, i) => {
              return (
                <div key={field.id} className="flex flex-row gap-2">
                  <Form.Field>
                    <Form.Input type="text" name={`techs.${i}.title`} />
                    <Form.ErrorMessage field={`techs.${i}.title`} />
                  </Form.Field>

                  <Form.Field>
                    <Form.Input type="number" name={`techs.${i}.knowledge`} />
                    <Form.ErrorMessage field={`techs.${i}.knowledge`} />
                  </Form.Field>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-red-500"
                  >
                    <XCircle size={14} />
                  </button>
                </div>
              );
            })}
            <Form.ErrorMessage field="techs" />
          </Form.Field>

          <button
            type="submit"
            className="h-10 rounded bg-emerald-500 font-semibold text-white transition duration-300 hover:bg-emerald-600"
          >
            Salvar
          </button>
          {output && (
            <pre className="rounded-lg bg-zinc-800 p-6 text-sm text-zinc-100">
              {output}
            </pre>
          )}
        </form>
      </FormProvider>
    </main>
  );
}
