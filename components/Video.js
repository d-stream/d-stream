import React from "react";
import Head from "next/head";
import Header from "./Header";

export default props => {

    return (



        < div >
            <Header />

            <Head>
                <link
                    rel="stylesheet"
                    href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                />
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css?family=Exo+2:400,700i&display=swap"
                />
            </Head>
            <style jsx global>{`
        * {
          font-family: "Exo 2", sans-serif;
        }
      `}</style>
            <div>{props.children}</div>
        </div >
    );
};
