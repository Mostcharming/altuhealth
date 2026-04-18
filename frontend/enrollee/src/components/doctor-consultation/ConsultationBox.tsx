"use client";
import Image from "next/image";

interface Message {
  id: number;
  senderName: string;
  senderRole: string;
  profileImage: string;
  message: string;
  isSender: boolean;
  timestamp: string;
  imagePreview?: string;
}

const consultationMessages: Message[] = [
  {
    id: 1,
    senderName: "Dr. AltuHealth",
    senderRole: "General Practitioner",
    profileImage: "/images/main/small.svg",
    message: "Hello! Thank you for reaching out. How can I help you today?",
    isSender: false,
    timestamp: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  },
  //   {
  //     id: 2,
  //     senderName: "You",
  //     senderRole: "",
  //     profileImage: "",
  //     message:
  //       "Hi Doctor, I've been experiencing some persistent headaches for the past week.",
  //     isSender: true,
  //     timestamp: "10:32 AM",
  //   },
];

export default function ConsultationBox() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      {/* Header */}
      <div className="sticky flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800 xl:px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-full max-w-[48px] rounded-full">
            <Image
              width={48}
              height={48}
              src="/images/main/small.svg"
              alt="Doctor profile"
              className="object-cover object-center w-full h-full overflow-hidden rounded-full"
            />
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
              Dr. Altuhealth
            </h5>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              General Practitioner • Online
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-700 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white/90 transition">
            <svg
              className="stroke-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.54488 11.7254L8.80112 10.056C8.94007 9.98476 9.071 9.89524 9.16639 9.77162C9.57731 9.23912 9.66722 8.51628 9.38366 7.89244L7.76239 4.32564C7.23243 3.15974 5.7011 2.88206 4.79552 3.78764L3.72733 4.85577C3.36125 5.22182 3.18191 5.73847 3.27376 6.24794C3.9012 9.72846 5.56003 13.0595 8.25026 15.7497C10.9405 18.44 14.2716 20.0988 17.7521 20.7262C18.2615 20.8181 18.7782 20.6388 19.1442 20.2727L20.2124 19.2045C21.118 18.2989 20.8403 16.7676 19.6744 16.2377L16.1076 14.6164C15.4838 14.3328 14.7609 14.4227 14.2284 14.8336C14.1048 14.929 14.0153 15.06 13.944 15.1989L12.2747 18.4552"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </button>

          <button className="text-gray-700 hover:text-brand-500 dark:text-gray-400 dark:hover:text-white/90 transition">
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.25 5.25C3.00736 5.25 2 6.25736 2 7.5V16.5C2 17.7426 3.00736 18.75 4.25 18.75H15.25C16.4926 18.75 17.5 17.7426 17.5 16.5V15.3957L20.1118 16.9465C20.9451 17.4412 22 16.8407 22 15.8716V8.12838C22 7.15933 20.9451 6.55882 20.1118 7.05356L17.5 8.60433V7.5C17.5 6.25736 16.4926 5.25 15.25 5.25H4.25ZM17.5 10.3488V13.6512L20.5 15.4325V8.56756L17.5 10.3488ZM3.5 7.5C3.5 7.08579 3.83579 6.75 4.25 6.75H15.25C15.6642 6.75 16 7.08579 16 7.5V16.5C16 16.9142 15.6642 17.25 15.25 17.25H4.25C3.83579 17.25 3.5 16.9142 3.5 16.5V7.5Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-h-full p-5 space-y-6 overflow-auto custom-scrollbar xl:space-y-8 xl:p-6">
        {consultationMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.isSender ? "justify-end" : "items-start gap-4"
            }`}
          >
            {!msg.isSender && (
              <div className="w-10 h-10 overflow-hidden rounded-full">
                <Image
                  width={40}
                  height={40}
                  src={msg.profileImage}
                  alt={`${msg.senderName} profile`}
                  className="object-cover object-center w-full h-full"
                />
              </div>
            )}

            <div className={`${msg.isSender ? "text-right" : ""}`}>
              {msg.imagePreview && (
                <div className="mb-2 w-full max-w-[270px] overflow-hidden rounded-lg">
                  <Image
                    width={270}
                    height={150}
                    src={msg.imagePreview}
                    alt="consultation image"
                    className="object-cover w-full"
                  />
                </div>
              )}

              <div
                className={`px-4 py-2.5 rounded-lg ${
                  msg.isSender
                    ? "bg-brand-500 text-white dark:bg-brand-500"
                    : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/90"
                } ${msg.isSender ? "rounded-tr-sm" : "rounded-tl-sm"}`}
              >
                <p className="text-sm leading-relaxed">{msg.message}</p>
              </div>
              <p className="mt-2 text-gray-500 text-xs dark:text-gray-400">
                {msg.isSender
                  ? msg.timestamp
                  : `${msg.senderName}, ${msg.timestamp}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Send Form */}
      <div className="sticky bottom-0 p-3 border-t border-gray-200 dark:border-gray-800">
        <form className="flex items-center justify-between gap-3">
          <div className="relative w-full">
            <button
              type="button"
              className="absolute text-gray-500 -translate-y-1/2 left-1 top-1/2 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90 transition sm:left-3"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12ZM10.0001 9.23256C10.0001 8.5422 9.44042 7.98256 8.75007 7.98256C8.05971 7.98256 7.50007 8.5422 7.50007 9.23256V9.23266C7.50007 9.92301 8.05971 10.4827 8.75007 10.4827C9.44042 10.4827 10.0001 9.92301 10.0001 9.23266V9.23256ZM15.2499 7.98256C15.9403 7.98256 16.4999 8.5422 16.4999 9.23256V9.23266C16.4999 9.92301 15.9403 10.4827 15.2499 10.4827C14.5596 10.4827 13.9999 9.92301 13.9999 9.23266V9.23256C13.9999 8.5422 14.5596 7.98256 15.2499 7.98256ZM9.23014 13.7116C8.97215 13.3876 8.5003 13.334 8.17625 13.592C7.8522 13.85 7.79865 14.3219 8.05665 14.6459C8.97846 15.8037 10.4026 16.5481 12 16.5481C13.5975 16.5481 15.0216 15.8037 15.9434 14.6459C16.2014 14.3219 16.1479 13.85 15.8238 13.592C15.4998 13.334 15.0279 13.3876 14.7699 13.7116C14.1205 14.5274 13.1213 15.0481 12 15.0481C10.8788 15.0481 9.87961 14.5274 9.23014 13.7116Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <input
              type="text"
              placeholder="Type your message..."
              className="w-full pl-12 pr-5 text-sm text-gray-800 bg-transparent border-none outline-hidden h-11 placeholder:text-gray-400 focus:border-0 focus:ring-0 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90 transition"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.9522 14.4422C12.9522 14.452 12.9524 14.4618 12.9527 14.4714V16.1442C12.9527 16.6699 12.5265 17.0961 12.0008 17.0961C11.475 17.0961 11.0488 16.6699 11.0488 16.1442V6.15388C11.0488 5.73966 10.7131 5.40388 10.2988 5.40388C9.88463 5.40388 9.54885 5.73966 9.54885 6.15388V16.1442C9.54885 17.4984 10.6466 18.5961 12.0008 18.5961C13.355 18.5961 14.4527 17.4983 14.4527 16.1442V6.15388C14.4527 6.14308 14.4525 6.13235 14.452 6.12166C14.4347 3.84237 12.5817 2 10.2983 2C8.00416 2 6.14441 3.85976 6.14441 6.15388V14.4422C6.14441 14.4492 6.1445 14.4561 6.14469 14.463V16.1442C6.14469 19.3783 8.76643 22 12.0005 22C15.2346 22 17.8563 19.3783 17.8563 16.1442V9.55775C17.8563 9.14354 17.5205 8.80775 17.1063 8.80775C16.6921 8.80775 16.3563 9.14354 16.3563 9.55775V16.1442C16.3563 18.5498 14.4062 20.5 12.0005 20.5C9.59485 20.5 7.64469 18.5498 7.64469 16.1442V9.55775C7.64469 9.55083 7.6446 9.54393 7.64441 9.53706L7.64441 6.15388C7.64441 4.68818 8.83259 3.5 10.2983 3.5C11.764 3.5 12.9522 4.68818 12.9522 6.15388L12.9522 14.4422Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            <button
              type="submit"
              className="flex items-center justify-center text-white rounded-lg h-11 w-11 bg-brand-500 hover:bg-brand-600 transition xl:ml-2"
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16865563 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.0751365 0.837654321,3.0429026 1.15159189,3.82844935 L3.03521743,10.2694423 C3.03521743,10.4265397 3.19218622,10.5836371 3.50612381,10.5836371 L16.6915026,11.3691241 C16.6915026,11.3691241 17.1624089,11.3691241 17.1624089,10.9 L17.1624089,12.1272231 C17.1624089,12.0429026 16.6915026,12.4744748 16.6915026,12.4744748 Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
